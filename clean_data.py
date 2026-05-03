import pandas as pd
import glob
import os

def clean_data():
    files = glob.glob('dataset/*')
    
    states_list = []
    districts_list = []
    subdistricts_list = []
    villages_list = []
    
    for file in files:
        print(f"Processing {file}...")
        try:
            if file.endswith('.xls'):
                df = pd.read_excel(file, engine='xlrd')
            elif file.endswith('.ods'):
                df = pd.read_excel(file, engine='odf')
            else:
                continue
                
            # Drop rows where all elements are NaN
            df = df.dropna(how='all')
            
            # Convert code columns to numeric, coercing errors to NaN so we can filter them
            df['MDDS STC'] = pd.to_numeric(df['MDDS STC'], errors='coerce')
            df['MDDS DTC'] = pd.to_numeric(df['MDDS DTC'], errors='coerce')
            df['MDDS Sub_DT'] = pd.to_numeric(df['MDDS Sub_DT'], errors='coerce')
            df['MDDS PLCN'] = pd.to_numeric(df['MDDS PLCN'], errors='coerce')
            
            # Drop rows where state code is NaN (usually header rows or invalid rows)
            df = df.dropna(subset=['MDDS STC'])
            
            # Convert to int after dropping NaN
            df['MDDS STC'] = df['MDDS STC'].astype(int)
            df['MDDS DTC'] = df['MDDS DTC'].astype(int)
            df['MDDS Sub_DT'] = df['MDDS Sub_DT'].astype(int)
            df['MDDS PLCN'] = df['MDDS PLCN'].astype(int)
            
            # State
            state_df = df[['MDDS STC', 'STATE NAME']].drop_duplicates()
            states_list.append(state_df)
            
            # District (MDDS DTC != 0)
            district_df = df[df['MDDS DTC'] != 0][['MDDS STC', 'MDDS DTC', 'DISTRICT NAME']].drop_duplicates()
            districts_list.append(district_df)
            
            # Sub-District (MDDS Sub_DT != 0)
            subdistrict_df = df[df['MDDS Sub_DT'] != 0][['MDDS DTC', 'MDDS Sub_DT', 'SUB-DISTRICT NAME']].drop_duplicates()
            subdistricts_list.append(subdistrict_df)
            
            # Village (MDDS PLCN != 0)
            village_df = df[df['MDDS PLCN'] != 0][['MDDS Sub_DT', 'MDDS PLCN', 'Area Name']].drop_duplicates()
            villages_list.append(village_df)
            
        except Exception as e:
            print(f"Error processing {file}: {e}")

    print("Concatenating data...")
    # Combine and drop duplicates across all files
    states = pd.concat(states_list).drop_duplicates(subset=['MDDS STC']).reset_index(drop=True)
    districts = pd.concat(districts_list).drop_duplicates(subset=['MDDS DTC']).reset_index(drop=True)
    subdistricts = pd.concat(subdistricts_list).drop_duplicates(subset=['MDDS Sub_DT']).reset_index(drop=True)
    villages = pd.concat(villages_list).drop_duplicates(subset=['MDDS PLCN']).reset_index(drop=True)

    # Rename columns for clarity
    states.columns = ['state_code', 'state_name']
    districts.columns = ['state_code', 'district_code', 'district_name']
    subdistricts.columns = ['district_code', 'sub_district_code', 'sub_district_name']
    villages.columns = ['sub_district_code', 'village_code', 'village_name']
    
    # Strip whitespace
    states['state_name'] = states['state_name'].astype(str).str.strip()
    districts['district_name'] = districts['district_name'].astype(str).str.strip()
    subdistricts['sub_district_name'] = subdistricts['sub_district_name'].astype(str).str.strip()
    villages['village_name'] = villages['village_name'].astype(str).str.strip()

    os.makedirs('cleaned_data', exist_ok=True)
    
    print("Saving to CSV...")
    states.to_csv('cleaned_data/states.csv', index=False)
    districts.to_csv('cleaned_data/districts.csv', index=False)
    subdistricts.to_csv('cleaned_data/sub_districts.csv', index=False)
    villages.to_csv('cleaned_data/villages.csv', index=False)
    
    print(f"Data Cleaning Complete!")
    print(f"Total States: {len(states)}")
    print(f"Total Districts: {len(districts)}")
    print(f"Total SubDistricts: {len(subdistricts)}")
    print(f"Total Villages: {len(villages)}")

if __name__ == '__main__':
    clean_data()
