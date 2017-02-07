  ![](airplanner-logo-black.png)

AirPlanner is a SPA for planning flights.This application is created for planning short distance flights and to provide details about the route you have in mind by using Google Maps API.

I worked with UXUI designer(Revy Samia) to create UI. So far, the first sprint is completed and there are few user stories that are not fully available (mentioned below).

you can find the application here:
[heroku link](https://airplanner2.herokuapp.com/users/sign_in)

### Technilogies:
- HTML/CSS
- AngularJS
- Google Maps API
- Ruby on Rails
- Devise 
- PostgreSQL

### project duration:
Nov 18 - Nov 29

### Data Models
![](schema.png)

*User model is created using devise, here the most important fielad are mentions.

### Wireframes:
![](homepage.png)
![](wire.png)

Map is always fixed on the right section and using the navigation bar you can switch to different parts of the app.

### User Stories:
 Users can:
 - create use map to pick locations
 - see coodinates of the selected location
 - see the calculated distance between locations as they add new locations
 - see total distance
 - enter speed and see the time it takes to travell on(on way)
 - edit the route by deleting to adding new locations
 - save the route
 - view the saved routes list
 - the saved routes on the map is they click 'show' option
 - delete the saved route
 - see the weather forecast for a location they pick ( predications for the next 2days, every 3hrs)


