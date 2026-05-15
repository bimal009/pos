// import psycopg2
// import uuid
// from datetime import datetime

// units = [
//     # Weight
//     ("kg",            "kg",     True),
//     ("gram",          "g",      False),
//     ("milligram",     "mg",     False),
//     ("ton",           "ton",    False),
//     ("quintal",       "qtl",    False),
//     ("tola",          "tola",   False),
//     ("dharni",        "dhr",    False),
//     ("half kg",       "½kg",    False),
//     ("quarter kg",    "¼kg",    False),

//     # Volume
//     ("litre",         "ltr",    True),
//     ("millilitre",    "ml",     False),
//     ("gallon",        "gal",    False),
//     ("barrel",        "brl",    False),
//     ("fluid oz",      "fl oz",  False),

//     # Count / Packaging
//     ("piece",         "pcs",    False),
//     ("packet",        "pkt",    False),
//     ("box",           "box",    False),
//     ("carton",        "ctn",    False),
//     ("dozen",         "dz",     False),
//     ("pair",          "pr",     False),
//     ("set",           "set",    False),
//     ("bundle",        "bndl",   False),
//     ("roll",          "roll",   False),
//     ("sheet",         "sht",    False),
//     ("ream",          "ream",   False),
//     ("strip",         "strip",  False),
//     ("vial",          "vial",   False),
//     ("ampoule",       "amp",    False),
//     ("sachet",        "scht",   False),
//     ("pouch",         "pouch",  False),
//     ("can",           "can",    False),
//     ("bottle",        "btl",    False),
//     ("jar",           "jar",    False),
//     ("tin",           "tin",    False),
//     ("tube",          "tube",   False),
//     ("bag",           "bag",    False),
//     ("sack",          "sack",   False),
//     ("drum",          "drum",   False),
//     ("cylinder",      "cyl",    False),
//     ("capsule",       "cap",    False),
//     ("tablet",        "tab",    False),
//     ("injection",     "inj",    False),

//     # Portion / Serving
//     ("plate",         "plate",  False),
//     ("half plate",    "½ plate",False),
//     ("quarter plate", "¼ plate",False),
//     ("full",          "full",   False),
//     ("half",          "half",   False),
//     ("small",         "sm",     False),
//     ("medium",        "md",     False),
//     ("large",         "lg",     False),
//     ("extra large",   "xl",     False),
//     ("regular",       "reg",    False),
//     ("cup",           "cup",    False),
//     ("glass",         "glass",  False),
//     ("bowl",          "bowl",   False),
//     ("serving",       "serv",   False),

//     # Length / Area
//     ("metre",         "m",      True),
//     ("centimetre",    "cm",     True),
//     ("millimetre",    "mm",     False),
//     ("inch",          "in",     True),
//     ("foot",          "ft",     True),
//     ("yard",          "yd",     False),
//     ("square metre",  "m²",     True),
//     ("square foot",   "ft²",    True),

//     # Time-based (hotel / service)
//     ("per hour",      "hr",     False),
//     ("per day",       "day",    False),
//     ("per night",     "night",  False),
//     ("per week",      "week",   False),
//     ("per month",     "month",  False),
// ]

// conn = psycopg2.connect("YOUR_DATABASE_URL")
// cur = conn.cursor()

// now = datetime.utcnow()

// for name, abbreviation, allow_decimal in units:
//     cur.execute("""
//         INSERT INTO units (id, name, abbreviation, allow_decimal, is_system, shop_id, is_active, created_at, updated_at)
//         VALUES (%s, %s, %s, %s, true, null, true, %s, %s)
//         ON CONFLICT DO NOTHING
//     """, (str(uuid.uuid4()), name, abbreviation, allow_decimal, now, now))

// conn.commit()
// cur.close()
// conn.close()

// print(f"Seeded {len(units)} units")
