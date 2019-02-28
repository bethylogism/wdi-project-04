from app import app, db
from models.user import User, UserSchema
from models.bar import Bar, BarSchema
from models.crawl import Crawl, CrawlSchema, Stop, Comment, CommentSchema

user_schema = UserSchema()

with app.app_context():
    db.drop_all()
    db.create_all()

    mike, errors = user_schema.load({
        'username': 'mike',
        'email': 'mike',
        'bio': 'Strange',
        'password': 'password',
        'password_confirmation': 'password'
    })

    if errors:
        raise Exception(errors)

    db.session.add(mike)

    jujus = Bar(
        name='Jujus',
        address='Ely\'s Yard, 15 Hanbury St, London E1 6QR',
        lat=51.520886,
        lng=-0.073487,
        terrace=True,
        description='We go all the time on Firdays',
        hero='https://www.abouttimemagazine.co.uk/wp-content/uploads/2017/05/IMG_22701.jpg'
    )
    db.session.add(jujus)

    the_culpeper = Bar(
        name='The Culpeper',
        address='40 Commercial St, London E1 6LP',
        lat=51.5168921,
        lng=-0.0730285,
        terrace=True,
        description='Small but great roofterrace',
        hero='https://www.theculpeper.com/wp-content/uploads/2015/11/Details_080.jpg'
    )
    db.session.add(the_culpeper)

    discount_suit_company = Bar(
        name='Discount Suit Company',
        address='29 Wentworth St, London E1 7TB',
        lat=51.5166773,
        lng=0.0774967,
        terrace=False,
        description='Basement no light',
        hero='http://london.lecool.com/files/2014/05/APR_DSC_INTERIOR_BAR-1024x780.jpg'
    )

    db.session.add(discount_suit_company)

    east_end = Crawl(
        name='East End Crawl',
        description='Tour of the seven wonders of the East End'
    )

    east_end.stops = [
        Stop(bar=discount_suit_company, order=0)
    ]
    db.session.add(east_end)

    comment1 = Comment(content='Hate this crawl is dead rubbish', crawl=east_end)
    db.session.add(comment1)


    db.session.commit()
