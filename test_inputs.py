"""Test predictions with the collaborator's exact inputs."""
import sys
sys.path.insert(0, 'ml')
from predict import DiabetesPredictor

p = DiabetesPredictor('xgboost')

# Screenshot 1 & 3: Age 35, Male, 170cm, 70kg, BP=Elevated, History=None, Diet=5, Phys=5
# BMI = 70/(1.7^2) = 24.2
# glucose = 85 + 25 + 20 + 5 = 135
# insulin = 60 + 40 + 25 = 125
# bp = 85, pedigree = 0.2, pregnancies = 0, skin = 25
inputs1 = {
    'age': 35, 'bmi': 24.2, 'blood_pressure': 85,
    'glucose': 135, 'insulin': 125, 'skin_thickness': 25,
    'pregnancies': 0, 'diabetes_pedigree': 0.2
}
r1 = p.predict(inputs1)
prob1 = r1['prediction']['probability']
pct1 = r1['prediction']['probability_percentage']
risk1 = r1['risk']['label']
print(f"Test 1 (moderate male): prob={prob1}, pct={pct1}, risk={risk1}")

# Screenshot 2: Age 35, Male, 170cm, 259kg, BP=?, History=Parent/Sibling, Diet=2, Phys=2
# BMI = 259/(1.7^2) = 89.6 -> capped at 70 by Pydantic
# glucose = 85 + 40 + 32 + 30 + 5 = 192
# insulin = 60 + 100 + 64 + 40 = 264
# bp = 70 (default?), pedigree = 1.0, pregnancies = 0, skin = 25
inputs2 = {
    'age': 35, 'bmi': 70.0, 'blood_pressure': 70,
    'glucose': 192, 'insulin': 264, 'skin_thickness': 25,
    'pregnancies': 0, 'diabetes_pedigree': 1.0
}
r2 = p.predict(inputs2)
prob2 = r2['prediction']['probability']
pct2 = r2['prediction']['probability_percentage']
risk2 = r2['risk']['label']
print(f"Test 2 (extreme obese male): prob={prob2}, pct={pct2}, risk={risk2}")

# Screenshot 4: Age 35, Female, 150cm, 70kg, BP=High, History=Sibling, Diet=1, Physical=1
# BMI = 70/(1.5^2) = 31.1
# glucose = 85 + 45 + 36 + 20 + 5 = 191
# insulin = 60 + 70 + 72 + 45 = 247
# bp = 95, pedigree = 1.0, pregnancies = 1, skin = 25
inputs4 = {
    'age': 35, 'bmi': 31.1, 'blood_pressure': 95,
    'glucose': 191, 'insulin': 247, 'skin_thickness': 25,
    'pregnancies': 1, 'diabetes_pedigree': 1.0
}
r4 = p.predict(inputs4)
prob4 = r4['prediction']['probability']
pct4 = r4['prediction']['probability_percentage']
risk4 = r4['risk']['label']
print(f"Test 4 (high risk female): prob={prob4}, pct={pct4}, risk={risk4}")

# Now test the FALLBACK calculator logic for Screenshot 2
# Age 35, Male, 170cm, 259kg, BP=?, History=Parent/Sibling, Diet=2, Phys=2
score = 0
score += 10  # age 35 > 25
bmi_val = 259 / (1.7 ** 2)  # 89.6
score += 25  # bmi >= 30
# BP not specified in screenshot 2 message — assume elevated
score += 10  # Elevated
score += 20  # Parent or Sibling
score += (10 - 2) * 2  # diet = 2 -> +16
score += (10 - 2) * 2  # phys = 2 -> +16
print(f"\nFallback for test 2: {min(100, max(0, score))}")

# Fallback for test 1
score1 = 0
score1 += 10  # age > 35
score1 += 0   # bmi 24.2 < 25
score1 += 10  # Elevated
score1 += 0   # None
score1 += (10 - 5) * 2  # diet
score1 += (10 - 5) * 2  # phys
print(f"Fallback for test 1: {min(100, max(0, score1))}")
