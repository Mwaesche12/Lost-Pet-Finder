# Lost Pet Finder — Project Brief

## Background
This started as a personal search for a friend's lost dog, Cy, in Bethesda, MD. A scheduled
check of local shelter listings (Montgomery County Animal Services, DC and northern Virginia
shelters, Petco Love Lost, PawBoost) helped find him. DC-area shelters heard about the search
and asked for a public website or app that any lost-pet owner can use.

## Goal
A public, worldwide web app where an owner enters their lost pet's details and the area it went
missing, and the app checks shelters' found/stray intake listings and alerts the owner about
possible matches. Shelters use the app directly to post the animals they take in.

## Two kinds of users
- **Owners**: create a search for a lost pet, get alerts on possible matches.
- **Shelters**: sign up, post found/stray intakes (photo, species, breed, colour, size, markings,
  date found, location), manage listings, mark them reunited.

## Core owner flow
1. Owner creates a search: pet photos, species, breed, colour, size, markings, collar/microchip,
   name, date lost, and address or map pin where it was lost.
2. Owner picks a search radius (default about 25 miles / 40 km) and alert preferences (email, text).
3. App shows shelters inside that radius and the number of possible matches.
4. Owner pays the small one-time fee to see full match details and receive alerts.
5. Matches are re-checked as shelters post new intakes; owner is alerted on new matches.
6. Owner marks the pet as found, which closes the search.

## Data sources: rules
- DECIDED: shelters post directly in the app/website. No partner data feeds are needed to launch.
- Do NOT scrape Facebook or any other social network (breaks their terms, gets accounts banned).
  The app may link owners to relevant local lost-pet groups instead.
- Keep a pluggable "source adapter" interface so large shelters with their own software can
  feed data in later. This is optional and comes after launch.
- Until real shelters are posting, use clearly labelled sample data for development. Never
  present sample data to real users as real listings.

## Matching
- First pass: filter by species, date (found after date lost) and distance.
- Second pass: score on breed, colour, size and markings.
- Later: AI photo comparison between the owner's photos and shelter photos.
- Always present results as "possible matches" with a link to the shelter listing. Never as confirmed.

## Business model (DECIDED)
- Prices (DECIDED): **$9.99 one-time** for owners (per lost pet); **$19.99/month** subscription
  for recurring users such as shelters.
- Owners: one-time fee per lost pet. Show the number of possible matches before
  they pay, so the value is clear to a stressed owner.
- Shelters: monthly subscription for recurring use. Launch offer (DECIDED): one-time 50% off
  the first payment (so $9.99 for the first month) to help seed shelters. Consider free or very cheap posting at first to
  fill the supply side (cold-start problem: owners find nothing where no shelters have joined).
- Payments via Stripe (supports many countries and currencies). Keep prices configurable.

## Worldwide
- Distance units: miles/km switch. Currencies: local pricing.
- Languages (DECIDED): English and Spanish at launch. Build all text so it can be translated
  from the start; more languages later.
- Address and map search must work in any country.
- Privacy law (e.g. GDPR) applies to owner addresses and photos; sales tax / VAT in some countries.
- Launch region (DECIDED): all of North America (US, Canada, Mexico). Use miles/km and
  USD/CAD/MXN as appropriate. Matches only exist where shelters have joined.

## Phases
1. **Clickable prototype** (current task): owner flow (intake form, map with radius and
   shelters, results screen, alert settings), a simple shelter "post a found animal" screen,
   mock checkout. Sample data only. Language and units built in from the start.
2. **MVP**: real accounts, database, shelter dashboard and posting, matching, email alerts,
   real payments, hosting.
3. **Later**: text alerts, AI photo matching, adapters for large shelters, more languages and regions.

## Open questions
- Which shelters will be the first to try it (DC-area ones who asked)?

## Preferences
- Keep the owner flow simple and calm; users are stressed.
- Mobile-first design.
- Explain technical choices in plain language; the project owner is not a developer.
