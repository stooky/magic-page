## Magic Page
by Chris Fossenier

Magic Page is a working prototype of building on the 
platform and making it simple for anyone to access
the ai lead generation webchat.

## Some Nice to Haves
1) Find out the best way to get the "naked chat"
using the chat ID so you can get creative on how
you display the webchat without being bound to
the MyListing format. It might require a free
version of Inbox that we are comfortable 
activating for magic page purposes.

2) Concurrent session support. I have started on
this but was unable to complete it. If five people
hit the site at the same time, I will create a
unique ID for them and update the main database
but there is not a good system to keep track of
this through all of the things and showing the
final response.



## The Goal
The goal of this project was to get Vendasta's
products into the hands of anyone with zero
friction. In addition to that Magic Page does a
good job of lead creation and feeds those leads
directly into the platform in a way that can
be used by Vendasta and/or partners.

A secondary goal was to demonstrate how we can
quickly iterate with AI ( ChatGPT wrote this 
with my guidance ), our platform and creative ideas.
It is very easy to see how additional products
and pain points could quickly be addressed
and generate leads using this approach.

For example, there could be a "Rep Magic" page
that quickly checks a business' reputation given
and email and website. An engaging score could
be displayed ( the value ), and exposure to our
products can happen in under 30 seconds. The same
for snapshot, social posting, and many more.

## Areas of Improvement
The installation is currently configured to run on
a simple nodejs server, and could be improved to
run with a service like nginx for reliability and
scalability.

The application is not setup to handle concurrent
sessions in a reliable manner. The groundwork is
there with unique session, IDs, but there is more
work to be done to ensure that the unique session
is maintained for all visitors. I had planned to do
this but ran out of time.

Improved error checking is required. For example,
if someone was to enter an invalid website, but use
the proper formatting for a website URL, the app
does not handle this properly. Another example is
when the app gets a JSON payload from Zapier, if 
there are some special characters, it could error
out and not display the text as expected. All in
all, there is much room for improvement.



## Required Tech Stack
1. Linux ( was build using Ubuntu )
2. NextJS ( there is an install script to assist )
3. Postgres ( version )
4. ScreenShot API (screenshotapi.net)
5. Zapier API zapier.com
6. Vendasta Platform for Automations



## Server Setup
- Linux
- open up firewall for 80, 443 for node app 
- clone the Magic Page repo 
- install nextjs
- install postgres
- (optional) - could setup on nginx / other


## Linux Setup
Standard setup, make sure you size your instance
properly to achieve the performance you want
based on potential usage. Update your server.

## User Security
Lock down your instance as per your best practices
such as revoking root login, etc.

## Firewall Access
Open up your firewall to allow 80, 443 at a
minimum.

## Setup your SSL Certificates
Cerbot works good. Store your certs in a location
that your app will have access to, and add them
into the appropriate location in your .env.local file.

## Clone Magic Page
git clone https://github.com/stooky/magic-page
git ls-files -z | xargs -0 git update-index --assume-unchanged


## Install Nextjs
npm
npm install next react react-dom
scripts/installnpm.sh

## Install Postgres
## Run the command below in psql
CREATE EXTENSION dblink;
## then
CREATE DATABASE mp;
## Run the creation script database_scheme.sql in /scripts
\i /path/to/database_scheme.sql



