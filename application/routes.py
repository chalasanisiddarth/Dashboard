from application import app,db
from flask import jsonify
from bson import json_util
import json
import os
import csv

@app.route('/list')
def lists():
    data = db.data.find_one({"end_year": 2022})
    json_data = json_util.dumps(data)
    return json.loads(json_data)
    #return json.loads(json_util.dumps(db.data.find_one({"end_year": 2022})))

@app.route('/countries/<flag>')
def countries(flag):
    pipeline = [
        {
            "$group": {
                "_id": "$country" if flag=="country" else "$region",
                "frequency": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "country" if flag=="country" else "region": "$_id",
                "frequency": 1
            }
        }
    ]

    result = list(db.data.aggregate(pipeline))

    file_path = os.path.join(os.path.dirname(__file__), 'countries.csv')
    with open(file_path, newline='') as csvfile:
        countries_reader = csv.DictReader(csvfile)
        countries = {row['name']: row for row in countries_reader}

    filtered_result = []
    for r in result:
        if(r['country']!=""):
            r['longitude'] = countries[r['country']]['longitude']
            r['latitude'] = countries[r['country']]['latitude']
            filtered_result.append(r)

    return jsonify(filtered_result)

@app.route('/world')
def world():
    file_path = os.path.join(os.path.dirname(__file__), 'test.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)

@app.route('/total_articles')
def total():
    pipeline = [
        {"$count": "total_articles"}
    ]
    result = list(db.data.aggregate(pipeline))
    return jsonify(result)

@app.route('/filter/<category>')
def filter(category):
    group = "$"+category
    pipeline = [
        {"$group": {"_id": group}},
        {"$project": {category: "$_id", "_id": 0}}
    ]
    result = list(db.data.aggregate(pipeline))
    filtered_result = []
    for r in result:
        if(r[category]!=""):
            filtered_result.append(r)
    return jsonify(filtered_result)

#most relevance sources overall
@app.route('/top_sources')
def top_sources():

    pipeline = [
    {
        '$group': {
            '_id': '$source',
            'num_articles': {'$sum': 1},
            'avg_relevance': {'$avg': '$relevance'}
        }
    },
    {
        '$match': {
            'num_articles': {'$gt': 10}
        }
    },
    {
        '$sort': {
            'num_articles': -1,
            'avg_relevance': -1
        }
    },
    {
        '$limit': 5
    },
    {
        '$project': {
            '_id': 0,
            'source': '$_id',
            'num_articles': 1,
            'avg_relevance': 1
        }
    }
]
    result = list(db.data.aggregate(pipeline))
    sorted_result = sorted(result, key=lambda x: x['avg_relevance'], reverse=True)
    return jsonify(sorted_result)

@app.route('/no_of_articles/<flag1>/<flag2>')
#no of articles in a country or region
def no_of_articles(flag1,flag2):
    match_field = 'country' if flag1 == "country" else 'region' if flag1 == "region" else 'source' if flag1 == "source" else 'source'
    pipeline = [
        {
            '$match': {
                match_field: flag2
            }
        },
        {
            '$group': {
                '_id': f'${match_field}',
                'num_articles': {'$sum': 1}
            }
        },
        {
            '$project': {
                '_id': 0,
                match_field: '$_id',
                'num_articles': 1
            }
        }
    ]
    result = list(db.data.aggregate(pipeline))
    return jsonify(result)

#most relevance sources for a sector,topic,country
@app.route('/source/<flag1>/<flag2>')
def source(flag1,flag2):

    match_field = 'country' if flag1 == "country" else \
              ('sector' if flag1 == "sector" else \
              ('topic' if flag1 == "topic" else \
              ('region' if flag1 == "region" else 'source')))


    pipeline = [
    {
        '$match': {match_field: flag2}
    },
    {
        '$group': {
            '_id': '$source',
            'num_articles': {'$sum': 1},
            'avg_relevance': {'$avg': '$relevance'}
        }
    },
    {
        '$sort': {
            'num_articles': -1,
            'avg_relevance': -1
        }
    },
    {
        '$limit': 10
    },
    {
        '$project': {
            '_id': 0,
            'source': '$_id',
            'num_articles': 1,
            'avg_relevance': 1
        }
    }
]
    result = list(db.data.aggregate(pipeline))
    sorted_result = sorted(result, key=lambda x: x['avg_relevance'], reverse=True)
    return jsonify(sorted_result)

@app.route('/source_topics/<flag1>')
def source_topics(flag1):

    pipeline = [
        {
            '$match': {'source': flag1}
        },
        {
            '$group': {
                '_id': {'source': '$source', 'topic': '$topic'},
                'avg_relevance': {'$avg': '$relevance'}
            }
        },
        {
            '$sort': {
                'avg_relevance': -1
            }
        },
        {
            '$limit': 10
        },
        {
            '$project': {
                '_id': 0,
                'source': '$_id.source',
                'topic': '$_id.topic',
                'num_articles': 1,
                'avg_relevance': 1
            }
        }
    ]
    result = list(db.data.aggregate(pipeline))
    sorted_result = sorted(result, key=lambda x: x['avg_relevance'], reverse=True)
    return jsonify(sorted_result)


#return articles within a sector,source over years
@app.route('/timeline/<flag1>/<flag2>')

def timeline(flag1,flag2):
    match_field =   'source' if flag1 == "source" else 'sector'
    pipeline = [
    {
        '$match': {match_field: flag2, 'start_year': {'$exists': True}}
    },
    {
        '$group': {
            '_id': '$start_year',
            'num_articles': {'$sum': 1}
        }
    },
    {
        '$project': {
            '_id': 0,
            'start_year': '$_id',
            'num_articles': 1
        }
    },
    {
        '$sort': {'start_year': 1}  # Sort by year in ascending order
    }
]

    result = list(db.data.aggregate(pipeline))
    return jsonify(result)

#returning most influential topics in a sector
@app.route('/sector_topic/<flag1>')
def sector_topic(flag1):

    SectorName =  flag1

    pipeline = [
    {
        '$match': {'sector': SectorName, 'topic': {'$exists': True}}
    },
    {
        '$group': {
            '_id': '$topic',
            'count': {'$sum': 1}
        }
    },
    {
        '$project': {
            '_id': 0,
            'topic': '$_id',
            'count': 1
        }
    },
    {
        '$sort': {'count': -1}  # Sort by count in descending order
    }

]
    result = list(db.data.aggregate(pipeline))
    return jsonify(result)


#No of topics and what they are for a specific source
@app.route('/no_of_topics/<flag1>')

def no_of_topics(flag1):

    pipeline = [
    {
        '$match': {'source': flag1}
    },
    {
        '$group': {
            '_id': {'source': '$source', 'topic': '$topic'},
            'count': {'$sum': 1}
        }
    },
    {
        '$group': {
            '_id': '$_id.source',
            'topics': {'$push': {'topic': '$_id.topic', 'count': '$count'}},
            'total_topics': {'$sum': 1}
        }
    },
    {
        '$project': {
            '_id': 0,
            'source': '$_id',
            'total_topics': 1,
            'topics': 1
        }
    }
]

    result = list(db.data.aggregate(pipeline))
    return result

#average relevance of a source
@app.route('/avg_relevance/<flag1>')
def avg_relevance(flag1):

    pipeline = [
        {
            '$match': {'source': flag1}
        },
        {
            '$group': {
                '_id': '$source',
                'avg_relevance': {'$avg': '$relevance'}
            }
        },
        {
            '$project': {
                '_id': 0,
                'source': '$_id',
                'avg_relevance': 1
            }
        }
    ]
    result = list(db.data.aggregate(pipeline))
    return result

#sector distribution for a country or region
@app.route('/sector_distribution/<flag1>/<flag2>')
def sector_distribution(flag1,flag2):
    match_field=flag1
    pipeline = [
    {
        '$match': {match_field: flag2}
    },
    {
        '$group': {
            '_id': '$sector',
            'num_articles': {'$sum': 1}
        }
    },
    {
        '$project': {
            '_id': 0,
            'sector': '$_id',
            'num_articles': 1
        }
    }
]
    result = list(db.data.aggregate(pipeline))
    filtered_result = []
    for r in result:
        if(r['sector']!=""):
            filtered_result.append(r)
    return jsonify(filtered_result)

#Radar chart to visualize multiple dimensions like intensity, likelihood, and relevance for a sector or topic

@app.route('/radar/<flag1>/<flag2>')
def radar(flag1,flag2):

    match_field=flag1

    pipeline = [
    {
        '$match': {match_field : flag2}
    },
    {
        '$project': {
            '_id': 0,
            'intensity': 1,
            'relevance': 1,
            'likelihood': 1
        }
    }
]
         
    result = list(db.data.aggregate(pipeline))
    return result

#articles for a specific end_year
@app.route('/end_year/<flag1>')
def end_year(flag1):

    pipeline = [
    {
        '$match': {
            'end_year': int(flag1)
        }
    },
    {
        '$project': {
            '_id': 0,
            'title': '$title',
            'url': '$url'
        }
    }
]
    result = (list(db.data.aggregate(pipeline)))
    return jsonify(result)

#PEST world map
@app.route('/pest_world/<flag1>')
def pest_world(flag1):
    pipeline = [
    {
        '$match': {'pestle': flag1}
    },
    {
        '$group': {
            '_id': '$country',
            'count': {'$sum': 1}
        }
    },
    {
        '$project': {
            '_id': 0,
            'country': '$_id',
            'count': 1
        }
    }
]
    result = list(db.data.aggregate(pipeline))
    return result

#PEST top5
@app.route('/pest_top5/<flag1>')
def pest_top5(flag1):
    pipeline = [
    {
        '$match': {'pestle': flag1}
    },
    {
        '$group': {
            '_id': '$country',
            'count': {'$sum': 1}
        }
    },
    {
        '$project': {
            '_id': 0,
            'country': '$_id',
            'count': 1
        }
    },
    {
        '$sort': {'count': -1}
    },
    {
        '$limit': 6

    }
]
    result = list(db.data.aggregate(pipeline))
    return result

@app.route('/influential_pestle/<flag1>/<flag2>')
def influential_pestle(flag1, flag2):
    match_field=flag1

    pipeline = [
        {
            '$match': {match_field: flag2}
        },
        {
            '$group': {
                '_id': '$pestle',
                'num_articles': {'$sum': 1}
            }
        },
        
        {
            '$project': {
                '_id': 0,
                'pestle': '$_id',
                'num_articles': 1
            }
        },
        {
        '$sort': {'num_articles': -1}
        }
    ]
    result = list(db.data.aggregate(pipeline))
    filtered_result = []
    for r in result:
        if r['pestle'] in ["Economic", "Political", "Technological", "Social"]:
            filtered_result.append(r)
    
    pestle_dict = {entry['pestle']: entry['num_articles'] for entry in filtered_result}

    for pestle in ["Economic", "Political", "Technological", "Social"]:
        if pestle not in pestle_dict:
            pestle_dict[pestle] = 0 

    filtered_result = [{'pestle': pestle, 'num_articles': pestle_dict[pestle]} for pestle in pestle_dict]

    return jsonify(filtered_result)


    
    '''data = db.data.find_one({"end_year": 2022})
    json_data = json_util.dumps(data)
    return json.loads(json_data)
    #return json.loads(json_util.dumps(db.data.find_one({"end_year": 2022})))'''

    


