import json
from faker import Faker
import random
from datetime import datetime

fake = Faker("ro_RO")  # Use Romanian locale

players = []
for _ in range(250):
    player = {
        "firstName": fake.first_name_male(),
        "lastName": fake.last_name(),
        "age": random.randint(17, 35),
        "position": random.choice(
            [
                'Portar',
                'Fundaș stânga',
                'Fundaș dreapta',
                'Fundaș central',
                'Mijlocaș stânga',
                'Mijlocaș dreapta',
                'Mijlocaș central',
                'Extremă stânga',
                'Extremă dreapta',
                'Atacant',
            ]
        ),
        "dateStarted": int(datetime.timestamp(fake.date_time_between(start_date="-10y", end_date="-1y")) * 1000)
        # .strftime(
        #     "%Y-%m-%d"
        # ),
    }
    players.append(player)

with open("players.json", "w") as f:
    json.dump(players, f, indent=2)

print("Generated players.json")
