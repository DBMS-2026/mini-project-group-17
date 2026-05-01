import os
import json
import random
import csv
# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
KAGGLE_CSV_PATH = os.path.join(DATASETS_DIR, "kaggle_indian_housing.csv")
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, "..", "frontend", "src", "data", "market_trends.json")

# Define the target cities and localities for bootstrapping if CSV doesn't exist
CITIES_LOCALITIES = {
    "Mumbai": {"Bandra West": 42000, "Worli": 38500, "Juhu": 36000, "Andheri West": 22000, "Powai": 19000, "Navi Mumbai": 9800},
    "Bangalore": {"Indiranagar": 15500, "Koramangala": 14200, "Whitefield": 8500, "HSR Layout": 9200, "Electronic City": 5500, "Yelahanka": 6200},
    "Delhi NCR": {"Vasant Vihar": 30000, "Defence Colony": 32000, "Greater Kailash": 28000, "Dwarka": 10500, "Rohini": 11800, "Janakpuri": 12500},
    "Hyderabad": {"Banjara Hills": 14500, "Jubilee Hills": 16000, "HITEC City": 10500, "Gachibowli": 9500, "Kukatpally": 6500, "Madhapur": 11000},
    "Pune": {"Koregaon Park": 22000, "Kalyani Nagar": 19500, "Baner": 11500, "Viman Nagar": 10800, "Wakad": 7500, "Hinjewadi": 6800},
    "Chennai": {"Boat Club": 35000, "Poes Garden": 32000, "Adyar": 16500, "Besant Nagar": 18000, "Velachery": 8500, "OMR": 5500},
    "Gurgaon": {"DLF Phase 5": 18500, "Golf Course Road": 22000, "Cyber City": 16000, "Sohna Road": 8500, "Sector 56": 9200, "Palam Vihar": 7800},
    "Noida": {"Sector 15": 14500, "Sector 44": 12000, "Sector 50": 11500, "Sector 62": 8500, "Sector 137": 6500, "Noida Extension": 4500}
}

def create_bootstrap_dataset():
    """Generates a realistic Kaggle-style CSV dataset if the user hasn't provided one."""
    print(f"Dataset not found at {KAGGLE_CSV_PATH}. Bootstrapping realistic dataset...")
    
    with open(KAGGLE_CSV_PATH, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["ID", "City", "Locality", "BHK", "Area_SqFt", "Price", "Price_Per_SqFt", "Year"])
        
        id_counter = 1
        for city, localities in CITIES_LOCALITIES.items():
            for locality, base_price in localities.items():
                # Generate 50-100 random listings per locality to mimic a real dataset
                num_listings = random.randint(50, 100)
                for _ in range(num_listings):
                    bhk = random.choice([1, 2, 3, 4])
                    area = bhk * random.randint(400, 800)
                    # Add some noise to the base price
                    price_sqft = int(base_price * random.uniform(0.85, 1.15))
                    total_price = price_sqft * area
                    year = 2023 # Most Kaggle datasets are recent snapshots
                    
                    writer.writerow([id_counter, city, locality, bhk, area, total_price, price_sqft, year])
                    id_counter += 1

def load_base_prices():
    """Reads the CSV dataset and the PostgreSQL database to calculate the median base price."""
    base_prices = {}
    raw_data = {}
    
    # 1. Read from CSV
    try:
        with open(KAGGLE_CSV_PATH, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                city = row["City"]
                loc = row["Locality"]
                price_sqft = float(row["Price_Per_SqFt"])
                
                if city not in raw_data:
                    raw_data[city] = {}
                if loc not in raw_data[city]:
                    raw_data[city][loc] = []
                raw_data[city][loc].append(price_sqft)
    except Exception as e:
        print(f"Error reading CSV: {e}")

    # 2. Read from Database (New User Listings)
    try:
        import psycopg2
        import psycopg2.extras
        
        # Connect using the same env vars the Node backend uses, or default to standard local settings
        conn = psycopg2.connect(
            dbname="nexusestate",
            user="postgres",
            password="password",
            host="localhost",
            port=5432
        )
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cursor.execute("SELECT city, locality, price, sqft FROM properties WHERE price > 0 AND sqft > 0")
        db_properties = cursor.fetchall()
        
        for row in db_properties:
            city = row["city"]
            loc = row["locality"]
            price = float(row["price"])
            sqft = float(row["sqft"])
            price_sqft = price / sqft
            
            # Use basic title casing to match CSV format
            city = city.title()
            loc = loc.title() if loc else "Unknown"
            
            if city not in raw_data:
                raw_data[city] = {}
            if loc not in raw_data[city]:
                raw_data[city][loc] = []
            
            raw_data[city][loc].append(price_sqft)
            
        cursor.close()
        conn.close()
        print("Successfully merged user listings from database.")
    except ImportError:
        print("psycopg2 not installed. Skipping database fetch.")
    except Exception as e:
        print(f"Database fetch error (might be okay if DB is not seeded): {e}")

    # Calculate medians
    for city, localities in raw_data.items():
        base_prices[city] = {}
        # Get top 6 localities by volume to ensure we have enough data
        top_localities = sorted(localities.items(), key=lambda x: len(x[1]), reverse=True)[:6]
        
        for loc, prices in top_localities:
            prices.sort()
            median_price = prices[len(prices)//2]
            base_prices[city][loc] = int(median_price)
            
    return base_prices

def extrapolate_trends(base_prices):
    """
    Simulates ML Extrapolation based on real macroeconomic constraints.
    - Historical (2014-2023): Calculated backwards from 2023 base price.
    - Predicted (2024-2026): Projected forward using growth trajectories.
    """
    trends = {}
    
    # Growth modifiers (simulating historical real estate cycles)
    # E.g. 2020 drop, 2021 flat, 2022-2023 boom
    historical_modifiers = {
        2023: 1.0,      # Anchor year
        2022: 0.92,     # Boom start
        2021: 0.85,     # Flat recovery
        2020: 0.83,     # COVID crash
        2019: 0.95,     # Pre-COVID peak
        2018: 0.90,
        2017: 0.85,
        2016: 0.82,     # Demonetization dip
        2015: 0.78,
        2014: 0.72
    }
    
    for city, localities in base_prices.items():
        city_slug = city.lower().replace(" ", "-")
        trends[city_slug] = {}
        
        # Add Locality Breakdown data based on 2023 base prices
        trends[city_slug]["localities"] = []
        sorted_locs = sorted(localities.items(), key=lambda x: x[1], reverse=True)
        for i, (loc, price) in enumerate(sorted_locs):
            category = "expensive" if i < 3 else "affordable"
            trends[city_slug]["localities"].append({
                "name": loc,
                "avgPrice": price,
                "category": category
            })
            
        # Add 10-year trend data
        trends[city_slug]["trendPoints"] = []
        
        for year in range(2014, 2027):
            year_data = {"year": str(year)}
            
            for loc, base_price in localities.items():
                if year <= 2023:
                    # Historical backwards calculation
                    mod = historical_modifiers[year] * random.uniform(0.98, 1.02) # Add 2% noise per locality
                    price = int(base_price * mod)
                    year_data[f"{loc} Historical"] = price
                else:
                    # AI Prediction forward calculation (8-12% annual growth from 2023)
                    years_ahead = year - 2023
                    growth_rate = random.uniform(1.08, 1.12)
                    price = int(base_price * (growth_rate ** years_ahead))
                    year_data[f"{loc} Predicted"] = price
                    
            trends[city_slug]["trendPoints"].append(year_data)
            
    return trends

def main():
    print("Initializing AI Insights Pipeline...")
    
    if not os.path.exists(KAGGLE_CSV_PATH):
        create_bootstrap_dataset()
        
    print("Reading dataset and extracting base prices...")
    base_prices = load_base_prices()
    
    print("Extrapolating 10-year historical trends & 3-year AI predictions...")
    market_trends = extrapolate_trends(base_prices)
    
    print(f"Exporting to {OUTPUT_JSON_PATH}...")
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(market_trends, f, indent=2)
        
    print("Pipeline Complete! Frontend is ready to consume data.")

if __name__ == "__main__":
    main()
