//services
var app = angular.module("flightApp", ["ui.router"]);

app.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state("map", {
            url: "/map",
            abstract: true,
            templateUrl: "pages/map.html",
            controller: "MapController"
        })
        .state("map.newplan", {
            url: "/new-plan",
            templateUrl: "pages/plan.html",
            controller: "PlanController"
        })
        .state("map.weather", {
            url: "/weather",
            templateUrl: "pages/weather.html",
            controller: "WeatherController"
        })
        .state("map.user", {
            url: "/user",
            templateUrl: "pages/user.html",
            controller: "UserController"
        }).state("map.gps", {
                    url: "/gps",
                    templateUrl: "pages/gps.html",
                    controller: "GPSController"
                })
        .state("map.savedplan",{
            url: "/saved-plans",
            templateUrl: "pages/saved.html",
            controller: "HistroyController"
        });

    $urlRouterProvider.otherwise("/map/new-plan");
}]);


///MAP
app.controller('MapController',[ '$scope','$http' ,function($scope,$http) {
   $scope.labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $scope.labelIndex = 0;
    $scope.marker_list = [];
    $scope.distances=[];
    $scope.totalDistance=0;
    $scope.coordinates=[];
    $scope.weather_marker; // will be used for removing from the map
    $scope.route_colors = ["#b71c1c","#880e4f","#4a148c","#004d40","#ff6f00","#4e342e"];
    var flightPath_list =[];


    //calculates the distance between each near markers and add to total
    function calcDistance(source){
      if ($scope.coordinates.length == 1 && $scope.distances[0]!= 0)
        {
            $scope.distances.push(0);
            return;
        }
        var coor=[];
        var twoNodeDistance = function(){
           var lat1 = coor[0];
           var lat2 = coor[1];
           var lon1 = coor[2];
           var lon2 = coor[3];

          var radlat1 = Math.PI * lat1/180
          var radlat2 = Math.PI * lat2/180
          var theta = lon1-lon2
          var radtheta = Math.PI * theta/180
          var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          dist = Math.acos(dist)
          dist = dist * 180/Math.PI
          dist = dist * 60 * 1.1515
          //if (unit=="K") { dist = dist * 1.609344 }
          //if (unit=="N") { dist = dist * 0.8684 }
          dist= dist *  0.8684;
          $scope.distances.push(dist.toFixed(3));
          $scope.totalDistance += dist;
          $scope.totalDistance=$scope.totalDistance;
       }
       if(source == "add_new_marker"){
        coor.push($scope.coordinates[$scope.coordinates.length-2].lat);
        coor.push($scope.coordinates[$scope.coordinates.length-1].lat);
        coor.push($scope.coordinates[$scope.coordinates.length-2].lng);
        coor.push($scope.coordinates[$scope.coordinates.length-1].lng);
        twoNodeDistance();
      }

      if(source == "repainting_markers"){
        for(var i=1;i<$scope.coordinates.length;i++){
          coor =[];
          coor.push($scope.coordinates[i-1].lat);
          coor.push($scope.coordinates[i].lat);
          coor.push($scope.coordinates[i-1].lng);
          coor.push($scope.coordinates[i].lng);
          twoNodeDistance();
        }
      }
    }

    function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 9,center: {lat: 37.712, lng: -122.213},
            streetViewControl: true,
            mapTypeId: 'terrain'
        });


        google.maps.event.addListener(map, 'click', function(event) {
            var new_marker ={lat:event.latLng.lat(),lng:event.latLng.lng() };
            //remove weather marker if any
            if( $scope.weather_marker )
              {
                $scope.weather_marker.setMap(null);
                $scope.weather_marker =null;
              }
            $scope.coordinates.push(new_marker);
            addMarker(event.latLng, map);


            calcDistance("add_new_marker");
            $scope.$broadcast("flightapp:newmarker",new_marker);


           var flightPath = new google.maps.Polyline({
                path: $scope.coordinates,
                geodesic: true,
                strokeColor: '#ff0000',
                strokeOpacity: 1.0,
                strokeWeight: 4
            });
            flightPath.setMap(map);
            flightPath_list.push(flightPath);
        });


        $scope.$on("flightapp:formLatLng",function(event,lat,lng){
            $scope.coordinates.push({lat:lat,lng:lng});
             new_marker = new google.maps.Marker({
               position: {lat:lat,lng:lng},
               label: $scope.labels[$scope.labelIndex++ % $scope.labels.length],
               map: map
             });
           $scope.marker_list.push(new_marker);
           calcDistance("add_new_marker");

         var flightPath = new google.maps.Polyline({
              path: $scope.coordinates,
              geodesic: true,
              strokeColor: '#ff0000',
              strokeOpacity: 1.0,
              strokeWeight: 4
          });
          flightPath.setMap(map);
          flightPath_list.push(flightPath);
        });
        $scope.$on("flightapp:resetMap",function(){
               initMap();
               $scope.marker_list =[];
               $scope.coordinates = [];
               $scope.labelIndex=0;
        });

        $scope.$on("flightapp:shownodes",function(event,data,color_index) {
          $scope.coordinates = data;
          var temp_label_index = 0;
          var marker;
          for(var i =0; i<$scope.coordinates.length;i++){
            marker = new google.maps.Marker({
                  position: $scope.coordinates[i],
                  map: map,
                  label: $scope.labels[temp_label_index++]
                });
           marker.setMap(map);
           addPopUp(marker);
          }

            var flightPath = new google.maps.Polyline({
                path: $scope.coordinates,
                geodesic: true,
                strokeColor: $scope.route_colors[color_index],
                strokeOpacity: 1.0,
                strokeWeight: 4
            });
            flightPath.setMap(map);
        });

        //delete all nodes from the map
        $scope.clearMarkerAndPoly=function(map,source) {
          for (var i = 0; i <  $scope.marker_list.length; i++) {
            $scope.marker_list[i].setMap(map);
           }
           //remove weather marker if any
          if( $scope.weather_marker )
           {
             $scope.weather_marker.setMap(map);
             $scope.weather_marker =null;
           }
          $scope.labelIndex = 0;
          for(i=0;i<flightPath_list.length;i++){
            flightPath_list[i].setMap(map);
           }
           flightPath_list=[];
           if(source == 'actions'){
             $scope.marker_list = [];
             $scope.coordinates = [];
             $scope.save_flag = false;
             $scope.distances=[];
             $scope.totalDistance=0;
           }
        }
        $scope.setMapForAll=function(map){
          for (var i = 0; i <  $scope.marker_list.length; i++) {
            $scope.marker_list[i].setMap(map);
           }
           var flightPath = new google.maps.Polyline({
               path: $scope.coordinates,
               geodesic: true,
               strokeColor: '#ff0000',
               strokeOpacity: 1.0,
               strokeWeight: 4
           });
           flightPath.setMap(map);
           flightPath_list.push(flightPath);
        }


        //event listener for deleting marker from unsaved route
        $scope.$on("flightapp:updatemap_remove",function(){
          $scope.clearMarkerAndPoly(null);
        });

      $scope.$on("flightapp:updatemap_repaint",function(){
          $scope.labelIndex=0;
          $scope.setMapForAll(map);
          $scope.distances=[0];
          $scope.totalDistance = 0;
          calcDistance("repainting_markers");
      })
        //for adding info window to the marker
        var overlay = new google.maps.OverlayView();
        overlay.draw = function() {};
        overlay.setMap(map);

        function addMarker(location, map) {
            var marker = new google.maps.Marker({
                position: location,
                label: $scope.labels[$scope.labelIndex++ % $scope.labels.length],
                map: map
            });
           $scope.marker_list.push(marker);
           addPopUp(marker);
        }

        //shows the coordinates in the console when hover
        function addPopUp(marker){
          google.maps.event.addListener(marker, 'mouseover', function() {
              var projection = overlay.getProjection();
              var pixel = projection.fromLatLngToContainerPixel(marker.getPosition());
              console.log(marker.position.lat(),marker.position.lng());
          });
          var infoContent = "<b>Lat:</b> "+ marker.position.lat().toString()+" | <b>lng:</b>"+ marker.position.lng().toString();
          var infowindow = new google.maps.InfoWindow({
            content: infoContent
          });
          marker.addListener('click', function() {
            infowindow.open(map, marker);
          });
        }


    }

    initMap();

}]);


//PlanController.$inject = ['$http','$scope'];
///Plan
app.controller('PlanController',['$scope','$http', function($scope,$http) {
  //getting user
  var user = document.getElementById('user').getAttribute("value");
  $scope.name = document.getElementById('name').getAttribute("value");
  $scope.notGuest = ($scope.name != "guest");
  $scope.save_flag=false;
  $scope.success_save=false;
  $scope.routeName = null;
  $scope.route ={};
  $scope.speed;
  $scope.travelTime="0 hr : 0 m";
  $scope.error_save=false;
 // listening for any changes on the marker list and updating the view
  $scope.$on("flightapp:newmarker", function(event,data) {
     $scope.$apply(function () {
      if($scope.coordinates.length)
        $scope.save_flag=true;
        $scope.success_save=false;
    });
  });
   $scope.clearUserInput=function(){
     $scope.in_lat=null;
     $scope.in_lng=null;
   }
   $scope.refreshMap =function(){
     $scope.$emit("flightapp:resetMap");
   }
 $scope.saveRoute=function(){
  var route_id=null;
   //creating route if id is not available
       $scope.routeName=prompt("Please name this route");
      $http({
           method: "POST",
           url: "/routes",
           data: {
               route:{name:$scope.routeName,user_id:user,distance:$scope.totalDistance.toFixed(3)}
           }
       }).success(function(data) {
            route_id=data.id;
            // if success at the nodes to created route
            $http({
                    method: "POST",
                    url: "/routes/"+route_id+"/nodes",
                    data: {
                        node:$scope.coordinates
                  }
                }).success(function(data) {
                     $scope.save_flag=false;
                     $scope.success_save=true;
                     $scope.error_save=false;
                }).error(function() {
                    $scope.error_save=true;
                    $scope.success_save=false;
                });
       }).error(function() {
           $scope.error_save=true;
           $scope.success_save=false;
       });

 }

   $scope.getUserData = function(){
      if($scope.in_lng && $scope.in_lat){
        $scope.$emit("flightapp:formLatLng",$scope.in_lat,$scope.in_lng);
        $scope.save_flag=true;
      } else{
        alert("Please enter lat and lng before adding to table.")
      }
     }

 $scope.calcTravelTime = function(){
    var mph = $scope.speed * 1.152;
    var min = 0,hr = 0;
    min  = (($scope.totalDistance / mph)*60);
    hr = Math.floor(min / 60);
    min = Math.ceil(min - (hr*60));
    $scope.travelTime = hr+" hr: "+min+" m";

 }

 $scope.removeNode=function(node_index){
    $scope.$emit("flightapp:updatemap_remove");
    $scope.marker_list.splice(node_index,1);
    $scope.coordinates.splice(node_index,1);
    $scope.$emit("flightapp:updatemap_repaint");
  }

}]);

//PlanController.$inject = ['$scope', '$http'];


//HistroyController.$inject = ['$http','$scope'];
//saved routes
app.controller('HistroyController',['$scope','$http',function($scope,$http){
  $scope.allRoutes;
  $scope.nodes;
  getAllRoute();

  $scope.refreshMap =function(){
    var icon_selector;
    // set all the route icons back to black
    for(var i =0 ;i < $scope.allRoutes.length; i++){
      icon_selector = "#"+$scope.allRoutes[i].id;
      $(icon_selector).css("color","#000");
    }
    $scope.$emit("flightapp:resetMap");
  }
  function getAllRoute(){
  $http({
          method: "GET",
          url: "/routes/",
       }).success(function(data) {
           $scope.allRoutes = data;
      }).error(function() {
          alert("Error finding routes!");
      });

 }
 //get routes details
  $scope.getNodes=function(id){
       $http({
            method: "GET",
            url: "/routes/"+id,
         }).success(function(data) {
             $scope.nodes = data.nodes;
             var random_color_index=(Math.floor(Math.random() * 6));
             var icon = "#"+id; //created the seletor id for icon according to route id
             $(icon).css("color", $scope.route_colors[random_color_index] );
             $scope.$emit("flightapp:shownodes",$scope.nodes,random_color_index);

        }).error(function() {
            alert("Error finding routes!");
        });
  }

  //delete route
  $scope.removeRoute=function(id){
    $http({
            method: "DELETE",
            url: "/routes/"+id
         }).success(function(data) {
            //update the view
            getAllRoute();
        }).error(function() {
            alert("Error deleting routes!");
        });
  }

}]);

//HistroyController.$inject = ['$scope', '$http'];
//WeatherController.$inject = ['$http','$scope'];
//WEATHER
app.controller('WeatherController',['$scope', '$http',function($scope,$http) {
    var api_key = "6ee35593a7e1cb16b96c77a2f62e1211";
    var before_length = $scope.coordinates.length;
    $scope.radius;
    $scope.weather;
    $scope.future = 16;
    $scope.weather_location;
    $scope.weahter_data_ready=false;
    $scope.getWeather =function(){
       if($scope.coordinates.length == before_length+1)
       {   var weather_location = $scope.coordinates.pop();
           $scope.weather_marker  = $scope.marker_list.pop();

            $scope.weather_marker.setMap(null)
         $http({
                 method: "GET",
                 url: "//api.openweathermap.org/data/2.5/forecast?lat="+weather_location.lat+"&lon="+weather_location.lng +"&APPID="+api_key
                 }).success(function(data) {
                    // console.log("weather:  ",data);
                     $scope.weather_location = data.city;
                     $scope.weather= data.list;
                     $scope.labelIndex=0;
                     $scope.weahter_data_ready=true;
                 }).error(function() {
                     alert("Error getting weather");
               });
       }
       else{
          alert("Make sure you select a location on the map to get weather forecast");
       }
    }


}]);

app.controller('GPSController',['$scope', '$http',function($scope,$http) {
  $scope.myfile;
   $scope.sendGpsData = function(){
    //console.log($scope.myfile);
  }
}]);
