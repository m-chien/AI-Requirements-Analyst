import pandas as pd
df = pd.read_excel('d:/Private_Project/AIRequirementsAnalyst/AI_Requirements_Analyst_BA_Challenge_7_Ngay.xlsx')
with open('temp_excel_output.txt', 'w', encoding='utf-8') as f:
    f.write(df.to_string())
