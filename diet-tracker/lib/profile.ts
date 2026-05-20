export const PROFILE = {
  heightCm: 177.8,
  heightInches: 70,
  dob: new Date('2002-12-01'),
  getAge: (): number => {
    const today = new Date();
    const dob = new Date('2002-12-01');
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  },
};

/**
 * Mifflin-St Jeor BMR (male)
 * BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 */
export function calculateBMR(weightLbs: number): number {
  const weightKg = weightLbs * 0.453592;
  const age = PROFILE.getAge();
  return 10 * weightKg + 6.25 * PROFILE.heightCm - 5 * age + 5;
}

/**
 * Total Daily Energy Expenditure
 * Activity multipliers:
 *   1.2  = sedentary
 *   1.375 = lightly active
 *   1.55  = moderately active (default)
 *   1.725 = very active
 *   1.9   = extra active
 */
export function calculateTDEE(weightLbs: number, activityMultiplier = 1.55): number {
  return calculateBMR(weightLbs) * activityMultiplier;
}
