#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import json
import operator
import jinja2
import logging
import os
import webapp2
import datetime
from google.appengine.api import memcache


def get_jinja2_template(path):
    template_dir = os.path.dirname(__file__)
    jinja_environment = jinja2.Environment(loader=jinja2.FileSystemLoader([template_dir]))
    return jinja_environment.get_template(path)


def get_journal_date_for(date):
    # Returns a journal date for a given present date
    start_year = 2012
    journal_start_year = 1768
    date = date.split('-')
    journal_date = (journal_start_year + (int(date[0]) - start_year))
    journal_date = str(journal_date) + '-' + date[1] + '-' + date[2]
    return journal_date


def get_journal_entry(date):
    # Gets a journal entry for the given date
    cache_key = 'entry-' + date
    journal_entry = memcache.get(cache_key)
    if journal_entry is not None:
        return journal_entry
    else:
        json_path = os.path.join(os.path.split(__file__)[0], 'data.json')
        json_data = json.loads(file(json_path, 'rb').read())
        journal_entry = json_data[date]
        memcache.add(cache_key, journal_entry, 60)
        return journal_entry


# http://remote.bergcloud.com/developers/reference/metajson
class MetaJsonHandler(webapp2.RequestHandler):
    def get(self):
        value = {
            'owner_email': 'thud@thudgroup.com',
            'publication_api_version': '1.0',
            'name': 'Captain Cook\'s Voyage',
            'description': 'A daily entry from the captain\'s diary.',
            'delivered_on': 'every day',
            'send_timezone_info': True,
            'send_delivery_count': True,
            "external_configuration": False
        }

        self.response.headers.add_header('Content-Type', 'application/json')
        self.response.out.write(json.dumps(value))


# http://remote.bergcloud.com/developers/reference/edition
class EditionHandler(webapp2.RequestHandler):
    def get(self):
        delivery_time = self.request.get('local_delivery_time')
        delivery_count = int(self.request.get('delivery_count', 0))

        # Find the entry of the day
        # 2013-03-16T19:20:30.45+01:00
        edition_date = delivery_time.split('T')[0]
        journal_date = get_journal_date_for(edition_date)

        # Extract values
        try:
            values = get_journal_entry(journal_date)
        except Exception, e:
            self.error(404)
            self.response.out.write('No diary entry for today')
            return

        values['delivery_count'] = delivery_count

        template = get_jinja2_template('templates/edition.html')

        self.response.headers.add_header('ETag', 'lazy-etag-%d')
        self.response.out.write(template.render(values))


# http://remote.bergcloud.com/developers/reference/sample
class SampleHandler(webapp2.RequestHandler):
    def get(self):
        # Extract values
        # TODO: Let's find a special date for this one
        values = get_journal_entry('1768-10-27')

        template = get_jinja2_template('templates/edition.html')

        self.response.out.write(template.render(values))


# http://remote.bergcloud.com/developers/reference/validate_config
class ValidateConfigHandler(webapp2.RequestHandler):
    def post(self):
        pass  # TODO


# http://remote.bergcloud.com/developers/reference/configure
class ConfigureHandler(webapp2.RequestHandler):
    def get(self):
        pass  # TODO


# Extracts the route data from the data.json file
class RouteJsonHandler(webapp2.RequestHandler):
    def get(self):
        cache_key = 'route.json'
        route = memcache.get(cache_key)
        if route is None:
            json_path = os.path.join(os.path.split(__file__)[0], 'data.json')
            json_data = json.loads(file(json_path, 'rb').read())

            route = []
            for key, entry in json_data.items():
                if 'location' in entry:
                    route.append({
                        'date': key,
                        'location': entry['location']
                    })

            route.sort(key=operator.itemgetter('date'))
            memcache.add(cache_key, route, 60)

        self.response.headers.add_header('Content-Type', 'application/json')
        self.response.out.write(json.dumps(route))


# Get JSON for a diary entry
class EntryJsonHandler(webapp2.RequestHandler):
    def get(self, date):
        values = get_journal_entry(date)
        self.response.headers.add_header('Content-Type', 'application/json')
        self.response.out.write(json.dumps(values))


class MainHandler(webapp2.RequestHandler):
    def get(self, date):
        values = {}
        if date:
            values = get_journal_entry(date)
        template = get_jinja2_template('templates/index.html')
        self.response.out.write(template.render(values))

urls = [
    ('^/meta.json$', MetaJsonHandler),
    ('^/edition/?$', EditionHandler),
    ('^/sample/?$', SampleHandler),
    ('^/validate_config/?$', ValidateConfigHandler),
    ('^/configure/?$', ConfigureHandler),
    ('^/api/route$', RouteJsonHandler),
    ('^/api/entry/(\d{4}-\d{2}-\d{2})?$', EntryJsonHandler),
    ('^/(\d{4}-\d{2}-\d{2})?$', MainHandler),
]

app = webapp2.WSGIApplication(urls, debug=True)
