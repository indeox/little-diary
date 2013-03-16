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
import jinja2
import logging
import os
import webapp2


def get_jinja2_template(path):
    template_dir = os.path.dirname(__file__)
    jinja_environment = jinja2.Environment(loader=jinja2.FileSystemLoader([template_dir]))
    return jinja_environment.get_template(path)


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

        # If delivery count is 0, show a welcome message

        # Find the entry of the day

        # Extract values
        values = {
            'chapter': '',
            'entry': '',
            'date': '',
            'location': '',
            'weather': '',
            'wind': '',
        }
        template = get_jinja2_template('templates/edition.html')

        self.response.headers.add_header('ETag', 'lazy-etag-%d')
        self.response.out.write(template.render(values))


class SampleHandler(webapp2.RequestHandler):
    def get(self):
        # Extract values
        values = {
            'chapter': '',
            'entry': '',
            'date': '',
            'location': '',
            'weather': '',
            'wind': '',
        }
        template = get_jinja2_template('templates/edition.html')
        
        self.response.out.write(template.render(values))


class ValidateConfigHandler(webapp2.RequestHandler):
    def post(self):
        pass  # TODO


# http://remote.bergcloud.com/developers/reference/configure
class ConfigureHandler(webapp2.RequestHandler):
    def get(self):
        pass  # TODO


urls = [
    ('^/meta.json$', MetaJsonHandler),
    ('^/edition/?$', EditionHandler),
    ('^/sample/?$', SampleHandler),
    ('^/validate_config/?$', ValidateConfigHandler),
    ('^/configure/?$', ConfigureHandler),
]

app = webapp2.WSGIApplication(urls, debug=True)
