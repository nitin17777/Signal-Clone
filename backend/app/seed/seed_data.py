"""
Seed script for Signal Clone demo data.

Run from backend/ with venv active:
    python -m app.seed.seed_data

Seeds:
- 6 users with display names, phone numbers, placeholder avatars
- 2 direct conversations with 15-30 messages each, spanning several days,
  mixed sent/delivered/read statuses
- 2 group conversations with 4-5 members each, one admin per group
- At least one unread conversation per demo user
"""

import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Ensure `app` is importable when run as `python -m app.seed.seed_data`
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import bcrypt
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.conversation import Conversation
from app.models.conversation_member import ConversationMember
from app.models.message import Message
from app.models.message_status import MessageStatus
from app.models.user import User

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# ---------------------------------------------------------------------------
# Static demo data
# ---------------------------------------------------------------------------

USERS = [
    {
        "phone_number": "+919876543210",
        "username": "alice",
        "display_name": "Alice Sharma",
        "avatar_url": "https://api.dicebear.com/8.x/thumbs/svg?seed=alice",
        "status_message": "Available 🌿",
        "password": "password123",
    },
    {
        "phone_number": "+919876543211",
        "username": "bob",
        "display_name": "Bob Mehta",
        "avatar_url": "https://api.dicebear.com/8.x/thumbs/svg?seed=bob",
        "status_message": "At work 💼",
        "password": "password123",
    },
    {
        "phone_number": "+919876543212",
        "username": "charlie",
        "display_name": "Charlie Verma",
        "avatar_url": "https://api.dicebear.com/8.x/thumbs/svg?seed=charlie",
        "status_message": "🎵 Vibing",
        "password": "password123",
    },
    {
        "phone_number": "+919876543213",
        "username": "diana",
        "display_name": "Diana Kapoor",
        "avatar_url": "https://api.dicebear.com/8.x/thumbs/svg?seed=diana",
        "status_message": "Busy 🔴",
        "password": "password123",
    },
    {
        "phone_number": "+919876543214",
        "username": "evan",
        "display_name": "Evan Rao",
        "avatar_url": "https://api.dicebear.com/8.x/thumbs/svg?seed=evan",
        "status_message": "On a call 📞",
        "password": "password123",
    },
    {
        "phone_number": "+919876543215",
        "username": "fiona",
        "display_name": "Fiona Nair",
        "avatar_url": "https://api.dicebear.com/8.x/thumbs/svg?seed=fiona",
        "status_message": "Hey there! 👋",
        "password": "password123",
    },
]

# Messages for direct conv 1: Alice ↔ Bob (25 messages over 3 days)
DIRECT_1_SCRIPT = [
    # day -3
    (-3, 0, 0, "Hey Bob! How's it going?"),
    (-3, 1, 1, "Alice! Long time 😄 Doing great, just wrapped up a project."),
    (-3, 2, 0, "That's awesome! What kind of project?"),
    (-3, 3, 1, "A mobile app for a local restaurant. Took me about two weeks."),
    (-3, 4, 0, "Nice! Did they go live yet?"),
    (-3, 5, 1, "Yeah, launched yesterday actually 🎉"),
    (-3, 6, 0, "Congrats!! 🥳"),
    # day -2
    (-2, 0, 1, "By the way, are you free this weekend?"),
    (-2, 1, 0, "Should be, why?"),
    (-2, 2, 1, "Thinking of doing a small hike. Wanna join?"),
    (-2, 3, 0, "Ooh yes! Where?"),
    (-2, 4, 1, "Probably Coorg. Takes about 3 hours to drive there."),
    (-2, 5, 0, "Sounds perfect. I'll check with Fiona too."),
    (-2, 6, 1, "The more the merrier 😄"),
    (-2, 7, 0, "What time are we leaving?"),
    (-2, 8, 1, "6am sharp. Don't be late 😅"),
    # day -1
    (-1, 0, 0, "Packing my stuff now, so excited!"),
    (-1, 1, 1, "Same! Don't forget sunscreen."),
    (-1, 2, 0, "Already packed 😎"),
    (-1, 3, 1, "Good. Charlie is joining too btw."),
    (-1, 4, 0, "The more the merrier indeed haha"),
    # today (unread for Bob — last 4 msgs)
    (0, 0, 0, "Good morning! Ready for today?"),
    (0, 1, 0, "Just left home, 5 min away!"),
    (0, 2, 0, "Waiting at the parking lot 🚗"),
    (0, 3, 0, "Hello?? Bob are you up?? 😂"),
]

# Messages for direct conv 2: Charlie ↔ Diana (18 messages over 2 days)
DIRECT_2_SCRIPT = [
    # day -2
    (-2, 0, 0, "Diana! Did you get the project brief from Evan?"),
    (-2, 1, 1, "Yeah, just reading through it now."),
    (-2, 2, 0, "The deadline seems really tight."),
    (-2, 3, 1, "I know right, 3 days is crazy."),
    (-2, 4, 0, "Can we split it? I'll take the backend, you do UI?"),
    (-2, 5, 1, "Works for me. Let's sync up tonight?"),
    (-2, 6, 0, "8pm?"),
    (-2, 7, 1, "Perfect 👍"),
    # day -1
    (-1, 0, 1, "Hey, our sync last night was super productive!"),
    (-1, 1, 0, "Yeah we covered a lot of ground. How's the UI coming along?"),
    (-1, 2, 1, "About 40% done. The design system is actually pretty clean."),
    (-1, 3, 0, "Nice! Backend APIs are mostly done, just testing edge cases."),
    (-1, 4, 1, "Let me know when you push so I can integrate."),
    (-1, 5, 0, "Will do. Probably by tonight."),
    # today (unread for Diana — last 3 msgs)
    (0, 0, 0, "Just pushed to main! Check the PR."),
    (0, 1, 0, "Also updated the README with setup steps."),
    (0, 2, 0, "Let me know if you hit any issues during integration 🙏"),
]

# Group 1: "Weekend Hikers" — Alice, Bob, Charlie, Fiona; Alice=admin
GROUP_1_MEMBERS = [
    ("alice", "admin"),
    ("bob", "member"),
    ("charlie", "member"),
    ("fiona", "member"),
]
GROUP_1_SCRIPT = [
    # day -2
    (-2, 0, "alice", "Hey everyone! Weekend hike is confirmed 🥾"),
    (-2, 1, "bob", "I'm in! 🙌"),
    (-2, 2, "charlie", "Finally! I've been waiting for this."),
    (-2, 3, "fiona", "Me too! What's the trail?"),
    (-2, 4, "alice", "Tadiyandamol peak in Coorg. About 5km trek."),
    (-2, 5, "charlie", "Oh that one is stunning, great choice Alice!"),
    (-2, 6, "fiona", "Should we arrange carpooling?"),
    (-2, 7, "bob", "My car fits 4. I can drive."),
    (-2, 8, "alice", "Perfect! Let's all meet at Bob's place at 5:45am."),
    # day -1
    (-1, 0, "fiona", "What should we bring? Any packing list?"),
    (-1, 1, "alice", "Water (at least 2L), snacks, sunscreen, light jacket."),
    (-1, 2, "charlie", "I'll bring some energy bars for everyone."),
    (-1, 3, "bob", "And I'll get the first-aid kit."),
    (-1, 4, "fiona", "You guys are so organised! ❤️"),
    # today (unread for Charlie and Fiona)
    (0, 0, "alice", "Good morning hikers! 🌅 Today's the day!"),
    (0, 1, "bob", "Ready! Just loading the car."),
]

# Group 2: "Project Phoenix" — Evan, Diana, Alice, Bob, Fiona; Evan=admin
GROUP_2_MEMBERS = [
    ("evan", "admin"),
    ("diana", "member"),
    ("alice", "member"),
    ("bob", "member"),
    ("fiona", "member"),
]
GROUP_2_SCRIPT = [
    # day -3
    (-3, 0, "evan", "Welcome to Project Phoenix team! 🔥"),
    (-3, 1, "diana", "Excited to be here!"),
    (-3, 2, "alice", "Same! What's our first milestone?"),
    (-3, 3, "evan", "MVP by end of month. Design first, then dev."),
    (-3, 4, "bob", "Sounds achievable. Who's doing what?"),
    (-3, 5, "evan", "Diana – UI/UX, Alice & Bob – backend, Fiona – QA."),
    (-3, 6, "fiona", "QA! Perfect, I love breaking things 😈"),
    # day -2
    (-2, 0, "diana", "Design mockups are up in Figma. Please review!"),
    (-2, 1, "alice", "Looks clean Diana! Left some comments."),
    (-2, 2, "bob", "Love the color palette 🎨"),
    (-2, 3, "diana", "Thanks! Will incorporate feedback by EOD."),
    (-2, 4, "evan", "Great velocity team 💪"),
    # day -1
    (-1, 0, "alice", "Backend scaffolding is done. Starting on auth routes."),
    (-1, 1, "bob", "I'll take the messaging API."),
    (-1, 2, "fiona", "Setting up test environment now."),
    # today (unread for all except Evan)
    (0, 0, "evan", "Daily standup in 5 mins! Jump on the call."),
    (0, 1, "evan", "Link: meet.example.com/phoenix"),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def ts(days_offset: int, hour_offset: int) -> datetime:
    """Return a deterministic timestamp relative to now."""
    base = datetime.utcnow().replace(hour=8, minute=0, second=0, microsecond=0)
    return base + timedelta(days=days_offset) + timedelta(hours=hour_offset)


async def get_or_create_user(session: AsyncSession, data: dict) -> User:
    result = await session.execute(select(User).where(User.username == data["username"]))
    user = result.scalar_one_or_none()
    if user:
        return user
    user = User(
        phone_number=data["phone_number"],
        username=data["username"],
        display_name=data["display_name"],
        avatar_url=data["avatar_url"],
        status_message=data["status_message"],
        password_hash=hash_password(data["password"]),
        is_online=data["username"] in ("alice", "evan"),
        created_at=datetime.utcnow() - timedelta(days=30),
    )
    session.add(user)
    await session.flush()
    return user


async def create_direct_conversation(
    session: AsyncSession,
    user_a: User,
    user_b: User,
    script: list[tuple],
) -> Conversation:
    """Create a direct conversation and seed messages with mixed statuses."""
    conv = Conversation(
        type="direct",
        created_by=user_a.id,
        created_at=ts(-3, 0),
    )
    session.add(conv)
    await session.flush()

    # Members
    members = [
        ConversationMember(conversation_id=conv.id, user_id=user_a.id, role="member", joined_at=ts(-3, 0)),
        ConversationMember(conversation_id=conv.id, user_id=user_b.id, role="member", joined_at=ts(-3, 0)),
    ]
    session.add_all(members)
    await session.flush()

    users = [user_a, user_b]
    last_msg = None

    for day_offset, hour_offset, sender_idx, content in script:
        sender = users[sender_idx]
        recipient = users[1 - sender_idx]
        created = ts(day_offset, hour_offset)

        msg = Message(
            conversation_id=conv.id,
            sender_id=sender.id,
            content=content,
            created_at=created,
            is_deleted=False,
        )
        session.add(msg)
        await session.flush()

        # Determine status based on when message was sent
        # Today's messages from sender = unread for recipient (sent only)
        # Yesterday = delivered
        # Older = read
        if day_offset == 0:
            status_for_recipient = "sent"
        elif day_offset == -1:
            status_for_recipient = "delivered"
        else:
            status_for_recipient = "read"

        session.add(MessageStatus(
            message_id=msg.id,
            user_id=recipient.id,
            status=status_for_recipient,
            updated_at=created,
        ))
        last_msg = msg

    # Update last_message_at
    conv.last_message_at = ts(0, len([s for s in script if s[0] == 0]) - 1)

    # Set last_read_message_id: user_a (sender of last unread) has read everything
    # user_b has NOT read today's messages → last_read = last message from yesterday
    yesterday_msgs = [s for s in script if s[0] < 0]
    last_yesterday_hour = yesterday_msgs[-1][1] if yesterday_msgs else 0
    # We find the message sent at that timestamp by querying flush state
    # Simpler: track message count up to yesterday
    total_msgs_result = await session.execute(
        select(Message).where(Message.conversation_id == conv.id)
    )
    all_msgs = total_msgs_result.scalars().all()
    yesterday_msgs_orm = [m for m in all_msgs if m.created_at.date() < datetime.utcnow().date()]

    # Update member last_read_message_id
    member_a = next(m for m in members if m.user_id == user_a.id)
    member_b = next(m for m in members if m.user_id == user_b.id)

    if yesterday_msgs_orm:
        member_a.last_read_message_id = all_msgs[-1].id  # sender read everything
        member_b.last_read_message_id = yesterday_msgs_orm[-1].id  # unread today's msgs

    return conv


async def create_group_conversation(
    session: AsyncSession,
    name: str,
    avatar_url: str,
    member_specs: list[tuple],  # (username, role)
    script: list[tuple],        # (day, hour, username, content)
    user_map: dict[str, User],
) -> Conversation:
    """Create a group conversation and seed messages."""
    admin_username = next(u for u, r in member_specs if r == "admin")
    creator = user_map[admin_username]

    conv = Conversation(
        type="group",
        name=name,
        avatar_url=avatar_url,
        created_by=creator.id,
        created_at=ts(-3, 0),
    )
    session.add(conv)
    await session.flush()

    # Members
    member_objs: dict[str, ConversationMember] = {}
    for username, role in member_specs:
        user = user_map[username]
        cm = ConversationMember(
            conversation_id=conv.id,
            user_id=user.id,
            role=role,
            joined_at=ts(-3, 0),
        )
        session.add(cm)
        member_objs[username] = cm
    await session.flush()

    all_msgs: list[Message] = []

    for day_offset, hour_offset, sender_username, content in script:
        sender = user_map[sender_username]
        created = ts(day_offset, hour_offset)
        msg = Message(
            conversation_id=conv.id,
            sender_id=sender.id,
            content=content,
            created_at=created,
            is_deleted=False,
        )
        session.add(msg)
        await session.flush()
        all_msgs.append(msg)

        # Create statuses for all recipients (non-senders)
        for username, _ in member_specs:
            if username == sender_username:
                continue
            recipient = user_map[username]
            if day_offset == 0:
                status_val = "sent"
            elif day_offset == -1:
                status_val = "delivered"
            else:
                status_val = "read"
            session.add(MessageStatus(
                message_id=msg.id,
                user_id=recipient.id,
                status=status_val,
                updated_at=created,
            ))

    conv.last_message_at = ts(0, len([s for s in script if s[0] == 0]) - 1)

    # Set last_read: admin has read all; members have unread = today's messages
    yesterday_msgs_orm = [m for m in all_msgs if m.created_at.date() < datetime.utcnow().date()]
    last_read_id = yesterday_msgs_orm[-1].id if yesterday_msgs_orm else None

    for username, role in member_specs:
        cm = member_objs[username]
        if role == "admin":
            cm.last_read_message_id = all_msgs[-1].id  # admin read everything
        else:
            cm.last_read_message_id = last_read_id  # unread today's

    return conv


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------

async def seed() -> None:
    async with AsyncSessionLocal() as session:
        # ---- Wipe existing seed data cleanly ----
        print("Clearing existing data...")
        await session.execute(delete(MessageStatus))
        await session.execute(delete(Message))
        await session.execute(delete(ConversationMember))
        await session.execute(delete(Conversation))
        await session.execute(delete(User))
        await session.commit()

        # ---- Create users ----
        print("Creating users...")
        user_map: dict[str, User] = {}
        for u_data in USERS:
            user = await get_or_create_user(session, u_data)
            user_map[u_data["username"]] = user
        await session.commit()

        alice = user_map["alice"]
        bob = user_map["bob"]
        charlie = user_map["charlie"]
        diana = user_map["diana"]
        evan = user_map["evan"]
        fiona = user_map["fiona"]

        # ---- Direct conversation 1: Alice <-> Bob ----
        print("Seeding direct conversation: Alice <-> Bob...")
        conv1 = await create_direct_conversation(session, alice, bob, DIRECT_1_SCRIPT)

        # ---- Direct conversation 2: Charlie <-> Diana ----
        print("Seeding direct conversation: Charlie <-> Diana...")
        conv2 = await create_direct_conversation(session, charlie, diana, DIRECT_2_SCRIPT)

        # ---- Group 1: Weekend Hikers ----
        print("Seeding group: Weekend Hikers...")
        conv3 = await create_group_conversation(
            session,
            name="Weekend Hikers",
            avatar_url="https://api.dicebear.com/8.x/shapes/svg?seed=hikers",
            member_specs=GROUP_1_MEMBERS,
            script=GROUP_1_SCRIPT,
            user_map=user_map,
        )

        # ---- Group 2: Project Phoenix ----
        print("Seeding group: Project Phoenix...")
        conv4 = await create_group_conversation(
            session,
            name="Project Phoenix",
            avatar_url="https://api.dicebear.com/8.x/shapes/svg?seed=phoenix",
            member_specs=GROUP_2_MEMBERS,
            script=GROUP_2_SCRIPT,
            user_map=user_map,
        )

        await session.commit()

        # ---- Summary ----
        print("\n[OK] Seed complete!")
        print(f"   Users:         {len(USERS)}")
        print(f"   Conversations: 4 (2 direct, 2 groups)")
        print(f"   Messages:")
        print(f"     - Alice <-> Bob:      {len(DIRECT_1_SCRIPT)} messages")
        print(f"     - Charlie <-> Diana:  {len(DIRECT_2_SCRIPT)} messages")
        print(f"     - Weekend Hikers:   {len(GROUP_1_SCRIPT)} messages")
        print(f"     - Project Phoenix:  {len(GROUP_2_SCRIPT)} messages")
        print("\n   Unread status (today's messages are 'sent' = unread for recipients):")
        print("     - Bob has unread messages from Alice")
        print("     - Diana has unread messages from Charlie")
        print("     - Charlie & Fiona have unread in Weekend Hikers")
        print("     - Diana, Alice, Bob, Fiona have unread in Project Phoenix")
        print("\n   Demo credentials (all users, password: password123)")
        for u in USERS:
            print(f"     @{u['username']:10s} | {u['phone_number']} | {u['display_name']}")


if __name__ == "__main__":
    asyncio.run(seed())
