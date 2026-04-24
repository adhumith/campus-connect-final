import asyncio
from app.db.mongodb import connect_db, get_db
from datetime import datetime

async def seed():
    await connect_db()
    db = get_db()
    clubs = [
        'Fine Arts Club',
        'Phorartz Club',
        'Yuva Club',
        'Tamil Mandram',
        'Yoga Club'
    ]
    for club in clubs:
        existing = await db.clubs.find_one({'name': club})
        if not existing:
            await db.clubs.insert_one({'name': club, 'created_at': datetime.utcnow()})
            print(f'Added: {club}')
        else:
            print(f'Already exists: {club}')

asyncio.run(seed())