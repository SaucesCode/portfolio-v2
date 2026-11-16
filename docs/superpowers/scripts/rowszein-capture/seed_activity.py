# Fictional activity for the capture: sales, restocks, a partner payout and online orders, all through the
# real API as the browser sends them. Backend must be running on http://127.0.0.1:8010 with capture settings.
import random
import uuid
from datetime import date, timedelta

import requests

BASE = 'http://127.0.0.1:8010/api'
ORIGIN = 'http://localhost:5180'
random.seed(5)
today = date.today()


def session():
    s = requests.Session()
    s.headers.update({'Origin': ORIGIN, 'Referer': ORIGIN + '/'})
    return s


def csrf(s):
    return s.get(f'{BASE}/auth/csrf/').json()['data']['csrf_token']


def unwrap(body):
    return body.get('data', body) if isinstance(body, dict) else body


def get_all(s, path):
    out, url = [], f'{BASE}{path}'
    while url:
        data = unwrap(s.get(url).json())
        if isinstance(data, dict) and 'results' in data:
            out += data['results']
            url = data.get('next')
        else:
            out += data if isinstance(data, list) else []
            url = None
    return out


def check(response, what, shown=[0]):
    if not response.ok and shown[0] < 5:
        shown[0] += 1
        print(f'{what} refused: {response.status_code} {response.text[:240]}')
    return response.ok


owner = session()
token = csrf(owner)
assert owner.post(f'{BASE}/auth/login/', json={'username': 'demo-owner', 'password': 'Demo-owner-2026!'},
                  headers={'X-CSRFToken': token}).ok
token = csrf(owner)


def write_headers(**extra):
    return {'X-CSRFToken': token, 'Idempotency-Key': str(uuid.uuid4()), **extra}


products = {p['name']: p for p in get_all(owner, '/products/')}
assortments = get_all(owner, '/products/assortments/')
box_sizes = {b['size']: b for b in get_all(owner, '/products/box-sizes/')}
weights = {'Classic Glazed': 5, 'Chocolate Dip': 4, 'Cinnamon Sugar': 2, 'Bavarian Cream': 2, 'Ube Cream': 4,
           'Ube Cream Cheese Twist': 1, 'Chewy Choco Chip Cookie': 2, 'Fudge Brownie': 2}


def restock():
    for i in get_all(owner, '/ingredients/'):
        quantity, minimum = float(i['quantity']), float(i['minimum_stock'])
        if quantity < minimum * 2.5:
            check(owner.post(f'{BASE}/ingredients/{i["id"]}/adjustments/',
                             json={'delta': f'{minimum * 8:.2f}', 'reason': 'Delivery from the supplier (demo)'},
                             headers=write_headers(**{'If-Match': '"%s"' % i['stock_revision']})), 'restock')


made = 0
for d in range(120, -1, -1):
    day = today - timedelta(days=d)
    if day.weekday() in (0, 3) and d > 3:
        restock()
    growth = 0.6 + 0.6 * (120 - d) / 120
    for _ in range(max(2, round(random.randint(3, 6) * growth))):
        names = random.sample(list(weights), k=random.randint(1, 3))
        items = [{'product': products[n]['id'], 'quantity': random.randint(2, weights[n] + 3), 'unit_price': products[n]['price']}
                 for n in names]
        sale = {'date': day.isoformat(), 'notes': 'Demo sale', 'sale_items': items}
        roll = random.random()
        if roll < 0.15 and assortments:
            sale['boxes'] = [{'assortment': assortments[0]['id']}]
        elif roll < 0.25 and 12 in box_sizes:
            sale['boxes'] = [{'box_size': box_sizes[12]['id'], 'contents': [
                {'product': products['Ube Cream']['id'], 'quantity': 6}, {'product': products['Classic Glazed']['id'], 'quantity': 6}]}]
        made += check(owner.post(f'{BASE}/sales/', json=sale, headers=write_headers()), 'sale')
print('sales recorded:', made)

partner = get_all(owner, '/products/partners/')[0]
check(owner.post(f'{BASE}/products/partners/{partner["id"]}/payments/',
                 json={'date': (today - timedelta(days=7)).isoformat(), 'amount': '1840.00', 'note': 'Monthly payout (demo)'},
                 headers=write_headers()), 'partner payment')

# Customers order through the public checkout, each from their own browser session.
shop = unwrap(session().get(f'{BASE}/shop/settings/').json())
towns = shop['towns']
places = shop.get('meetup_places', [])


def next_day(weekdays, start=today + timedelta(days=2)):
    day = start
    while day.weekday() not in weekdays:
        day += timedelta(days=1)
    return day


orders = []
plan = [
    ('Demo Customer 1', 'delivery', [('Classic Glazed', 6), ('Ube Cream', 6)], 'gcash'),
    ('Demo Customer 2', 'meetup', [('Chocolate Dip', 4), ('Fudge Brownie', 2)], 'cod'),
    ('Demo Customer 3', 'delivery', [('Bavarian Cream', 3)], 'cod'),
    ('Demo Customer 4', 'delivery', [('Ube Cream Cheese Twist', 2), ('Chewy Choco Chip Cookie', 4)], 'gcash'),
    ('Demo Customer 5', 'delivery', [('Cinnamon Sugar', 12)], 'gcash'),
    ('Demo Customer 6', 'meetup', [('Classic Glazed', 3), ('Ube Cream', 3)], 'gcash'),
]
for n, (name, fulfilment, lines, payment) in enumerate(plan, start=1):
    customer = session()
    body = {
        'client_key': uuid.uuid4().hex, 'customer_name': name, 'phone': f'0900 000 00{n:02d}', 'fulfilment': fulfilment,
        'items': [{'product': products[p]['id'], 'quantity': q} for p, q in lines], 'payment_method': payment, 'website': '',
        'note': 'Demo order for the portfolio',
    }
    if fulfilment == 'meetup' and places:
        body.update(meetup_place=places[0]['id'], meetup_time='11:00', delivery_date=next_day({2, 5}).isoformat())
    else:
        body.update(town=towns[n % len(towns)]['id'], address=f'{n} Demo Street', delivery_date=next_day({0, 1, 2, 3, 4, 5}).isoformat())
    response = customer.post(f'{BASE}/orders/', json=body, headers={'X-CSRFToken': csrf(customer)})
    if check(response, 'order'):
        orders.append(unwrap(response.json()))

owned = get_all(owner, '/orders/manage/')
by_name = {o['customer_name']: o for o in owned}
for name in ('Demo Customer 3', 'Demo Customer 4', 'Demo Customer 5'):
    if name in by_name:
        check(owner.post(f'{BASE}/orders/manage/{by_name[name]["id"]}/confirm/', json={}, headers=write_headers()), 'confirm')
if 'Demo Customer 6' in by_name:
    check(owner.post(f'{BASE}/orders/manage/{by_name["Demo Customer 6"]["id"]}/decline/',
                     json={'message': 'Sorry, we are fully booked that day. Please choose another date.'}, headers=write_headers()), 'decline')
print('orders placed:', len(orders), '| statuses:', sorted(o['status'] for o in get_all(owner, '/orders/manage/')))
print('status token for capture:', orders[0].get('token') if orders else None)
