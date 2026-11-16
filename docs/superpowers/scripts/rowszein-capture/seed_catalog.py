# Fictional demonstration data for capturing Rowszein's Delight (repo main 26f0f63) for the portfolio.
# Run in a scratch clone only:  python manage.py shell < seed_catalog.py   (DJANGO_SETTINGS_MODULE=backend.capture_settings)
# Every person, place and link is invented; links use example.com and phone numbers use the unassigned 0900 prefix.
import random
from datetime import date, time, timedelta
from decimal import Decimal as D

from accounts.models import User
from expenses.models import Expense
from ingredients.models import Ingredient
from products.models import Assortment, AssortmentItem, BoxSize, Category, Partner, Product
from recipes.models import Recipe, RecipeIngredient
from shop.models import DeliveryHours, DeliveryTown, MeetupHours, MeetupPlace, ShopSettings

random.seed(11)
today = date.today()

for username, password, role, first, last in [
    ('demo-owner', 'Demo-owner-2026!', 'admin', 'Demo', 'Owner'),
    ('demo-staff', 'Demo-staff-2026!', 'staff', 'Demo', 'Cashier'),
]:
    if not User.objects.filter(username=username).exists():
        User.objects.create_user(username, password=password, role=role, first_name=first, last_name=last)

ing = {}
for name, unit, cost, minimum, quantity, category in [
    ('All-purpose flour', 'kg', 58, 5, 60, 'flour_grains'),
    ('White sugar', 'kg', 70, 3, 20, 'sweeteners'),
    ('Unsalted butter', 'kg', 480, 2, 12, 'dairy'),
    ('Eggs', 'pcs', 9, 60, 400, 'dairy'),
    ('Fresh milk', 'l', 95, 4, 30, 'dairy'),
    ('Instant yeast', 'g', D('1.2'), 200, 2000, 'flour_grains'),
    ('Cocoa powder', 'kg', 520, 1, 6, 'flavorings'),
    ('Powdered sugar', 'kg', 90, 2, 15, 'sweeteners'),
    ('Ube halaya', 'kg', 360, 2, 14, 'flavorings'),
    ('Cream cheese', 'kg', 520, 1, 6, 'dairy'),
]:
    ing[name], _ = Ingredient.objects.update_or_create(
        name=name,
        defaults=dict(unit=unit, cost_per_unit=D(str(cost)), minimum_stock=D(str(minimum)), quantity=D(str(quantity)),
                      category=category, supplier='Demo supplier'),
    )

# The app's migrations seed the shop's categories; use them rather than inventing new ones.
cats = {c.slug: c for c in Category.objects.all()}

base = [('All-purpose flour', D('1.0')), ('White sugar', D('0.15')), ('Unsalted butter', D('0.12')), ('Eggs', D('3')),
        ('Fresh milk', D('0.3')), ('Instant yeast', D('14'))]
menu = [
    ('Classic Glazed', 'classic', 35, [('Powdered sugar', D('0.3'))], True),
    ('Chocolate Dip', 'classic', 40, [('Cocoa powder', D('0.12')), ('Powdered sugar', D('0.2'))], True),
    ('Cinnamon Sugar', 'classic', 35, [('White sugar', D('0.1'))], False),
    ('Bavarian Cream', 'premium', 50, [('Fresh milk', D('0.4')), ('Eggs', D('2'))], False),
    ('Ube Cream', 'local', 55, [('Ube halaya', D('0.5'))], True),
    ('Ube Cream Cheese Twist', 'local', 60, [('Ube halaya', D('0.35')), ('Cream cheese', D('0.3'))], False),
]
products = {}
for name, cat, price, extra, featured in menu:
    p, _ = Product.objects.update_or_create(
        name=name, defaults=dict(category=cats[cat], price=D(price), is_featured=featured, description=f'{name} (demo product)'))
    products[name] = p
    r, _ = Recipe.objects.update_or_create(product=p, defaults=dict(yield_quantity=12, notes='Demo recipe'))
    r.recipe_ingredients.all().delete()
    merged = {}
    for n, q in base + extra:
        merged[n] = merged.get(n, D(0)) + q
    for n, q in merged.items():
        RecipeIngredient.objects.create(recipe=r, ingredient=ing[n], quantity=q)

partner, _ = Partner.objects.update_or_create(
    name='Demo Partner Bakery', defaults=dict(blurb='Cookies and brownies from a neighbouring kitchen (demo partner)', contact='demo@example.com'))
for name, price, payout, shape in [('Chewy Choco Chip Cookie', 45, 32, 'cookie'), ('Fudge Brownie', 60, 44, 'brownie')]:
    Product.objects.update_or_create(
        name=name, defaults=dict(category=cats['brownies'], price=D(price), partner=partner, partner_payout=D(payout),
                                 shape=shape, description=f'{name} from Demo Partner Bakery (demo product)'))

six, _ = BoxSize.objects.update_or_create(size=6, defaults=dict(price=D(200), max_flavors=2))
twelve, _ = BoxSize.objects.update_or_create(size=12, defaults=dict(price=D(380), max_flavors=3))
classic_box, _ = Assortment.objects.update_or_create(
    name='Classic Six', defaults=dict(box_size=six, description='Three Classic Glazed and three Chocolate Dip (demo box)'))
classic_box.items.all().delete()
AssortmentItem.objects.create(assortment=classic_box, product=products['Classic Glazed'], quantity=3)
AssortmentItem.objects.create(assortment=classic_box, product=products['Chocolate Dip'], quantity=3)

Expense.objects.all().delete()
for d in range(120, -1, -1):
    day = today - timedelta(days=d)
    if day.weekday() in (0, 3):
        Expense.objects.create(category='ingredient', amount=D(random.randint(700, 1500)), description='Flour, sugar and dairy restock (demo)', date=day)
    if day.day in (1, 15):
        Expense.objects.create(category='utilities', amount=D(1850), description='Electricity and water (demo)', date=day)
    if day.weekday() == 5:
        Expense.objects.create(category='packaging', amount=D(random.randint(300, 600)), description='Boxes and wax paper (demo)', date=day)
        Expense.objects.create(category='transportation', amount=D(random.randint(150, 350)), description='Market delivery (demo)', date=day)

settings = ShopSettings.objects.get(pk=1)
settings.messenger_url = 'https://example.com/messenger'
settings.facebook_url = 'https://example.com/facebook'
settings.email = 'shop@example.com'
settings.order_email = 'orders@example.com'
settings.phone = '0900 000 0000'
settings.notice = 'Demonstration data: a portfolio sample, not a real shop.'
settings.lead_days = 1
settings.order_cutoff = time(18, 0)
settings.show_hours = True
settings.payment_methods = ['gcash', 'cod']
settings.save()

for weekday in range(7):
    DeliveryHours.objects.update_or_create(
        weekday=weekday, defaults=dict(is_open=weekday != 6, opens=time(9, 0), closes=time(18, 0)))
DeliveryTown.objects.all().delete()
for name, fee in [('Town Centre (demo)', D(0)), ('Riverside (demo)', D(40)), ('Hillside (demo)', D(60))]:
    DeliveryTown.objects.create(name=name, fee=fee)

MeetupPlace.objects.all().delete()
for position, (name, note) in enumerate([('Town Plaza (demo)', 'By the fountain'), ('Market Gate (demo)', 'Near the jeepney stop')]):
    place = MeetupPlace.objects.create(name=name, note=note, position=position)
    for weekday in range(7):
        MeetupHours.objects.create(place=place, weekday=weekday, is_open=weekday in (2, 5), opens=time(10, 0), closes=time(16, 0))

print('catalogue ready:', Product.objects.count(), 'products,', Ingredient.objects.count(), 'ingredients,',
      Expense.objects.count(), 'expenses,', MeetupPlace.objects.count(), 'meet-up places')
