import json
from faker import Faker
import random

fake = Faker("ro_RO")  # Use Romanian locale

players = []
for _ in range(250):
    player = {
        "firstName": fake.first_name_male(),
        "lastName": fake.last_name(),
        "age": random.randint(17, 35),
        "position": random.choice(
            [
                "Portar",
                "Fundas stanga",
                "Fundas dreapta",
                "Fundas central",
                "Mijlocas stanga",
                "Mijlocas dreapta",
                "Mijlocas central",
                "Extrema stanga",
                "Extrema dreapta",
                "Atacant",
            ]
        ),
        "dateStarted": fake.date_between(start_date="-10y", end_date="today").strftime(
            "%Y-%m-%d"
        ),
    }
    players.append(player)

with open("players.json", "w") as f:
    json.dump(players, f, indent=2)

print("Generated players.json")
