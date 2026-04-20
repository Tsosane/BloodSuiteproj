import csv
import math
import random
from datetime import date, timedelta
from pathlib import Path


OUTPUT_PATH = Path(__file__).resolve().parents[1] / "data" / "ai_blood_demand_import_dataset.csv"
START_DATE = date(2024, 1, 1)
END_DATE = date(2026, 4, 21)
RANDOM_SEED = 42

BLOOD_TYPE_BASE_DEMAND = {
    "O+": 25,
    "A+": 20,
    "B+": 12,
    "O-": 8,
    "A-": 6,
    "B-": 4,
    "AB+": 3,
    "AB-": 1,
}

LESOTHO_HOLIDAYS = {
    date(2024, 1, 1): "New Year's Day",
    date(2024, 3, 11): "Moshoeshoe's Day",
    date(2024, 5, 1): "Workers' Day",
    date(2024, 5, 25): "Africa Day",
    date(2024, 7, 17): "King's Birthday",
    date(2024, 10, 4): "Independence Day",
    date(2024, 12, 25): "Christmas Day",
    date(2024, 12, 26): "Boxing Day",
    date(2025, 1, 1): "New Year's Day",
    date(2025, 3, 11): "Moshoeshoe's Day",
    date(2025, 5, 1): "Workers' Day",
    date(2025, 5, 25): "Africa Day",
    date(2025, 7, 17): "King's Birthday",
    date(2025, 10, 4): "Independence Day",
    date(2025, 12, 25): "Christmas Day",
    date(2025, 12, 26): "Boxing Day",
    date(2026, 1, 1): "New Year's Day",
    date(2026, 3, 11): "Moshoeshoe's Day",
}

ANOMALY_EVENTS = {
    date(2024, 12, 23): ("Holiday traffic surge", 1.30),
    date(2025, 2, 10): ("Malaria season demand rise", 1.22),
    date(2025, 8, 3): ("Weekend trauma spike", 1.28),
    date(2025, 12, 24): ("Christmas emergency surge", 1.35),
    date(2026, 1, 5): ("Post-holiday replenishment demand", 1.18),
}


def daterange(start, end):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def holiday_multiplier(current_date):
    if current_date in LESOTHO_HOLIDAYS:
        return 1.22
    if current_date + timedelta(days=1) in LESOTHO_HOLIDAYS:
        return 1.10
    if current_date - timedelta(days=1) in LESOTHO_HOLIDAYS:
        return 1.08
    return 1.0


def emergency_multiplier(current_date):
    if current_date in ANOMALY_EVENTS:
        return ANOMALY_EVENTS[current_date][1]
    return 1.0


def note_for_date(current_date):
    notes = []
    if current_date in LESOTHO_HOLIDAYS:
        notes.append(f"Public holiday: {LESOTHO_HOLIDAYS[current_date]}")
    if current_date in ANOMALY_EVENTS:
        notes.append(ANOMALY_EVENTS[current_date][0])
    return "; ".join(notes)


def demand_for_day(blood_type, current_date):
    base_demand = BLOOD_TYPE_BASE_DEMAND[blood_type]
    weekday = current_date.weekday()
    day_of_month = current_date.day
    day_of_year = current_date.timetuple().tm_yday

    weekly_factor = 1 + 0.30 * math.sin((2 * math.pi * weekday) / 7)
    monthly_factor = 1 + 0.18 * math.sin((2 * math.pi * day_of_month) / 30.5)
    yearly_factor = 1 + 0.08 * math.sin((2 * math.pi * day_of_year) / 365.25)
    holiday_factor = holiday_multiplier(current_date)
    anomaly_factor = emergency_multiplier(current_date)
    noise = random.gauss(0, max(1, base_demand * 0.16))

    demand = base_demand * weekly_factor * monthly_factor * yearly_factor * holiday_factor * anomaly_factor + noise
    return max(0, int(round(demand)))


def generate_rows():
    rows = []
    for current_date in daterange(START_DATE, END_DATE):
        date_note = note_for_date(current_date)
        for blood_type in BLOOD_TYPE_BASE_DEMAND:
            rows.append({
                "date": current_date.isoformat(),
                "blood_type": blood_type,
                "demand": demand_for_day(blood_type, current_date),
                "hospital_license_number": "",
                "notes": date_note,
            })
    return rows


def main():
    random.seed(RANDOM_SEED)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    rows = generate_rows()

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["date", "blood_type", "demand", "hospital_license_number", "notes"],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} rows at {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
