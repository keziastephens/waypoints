console.log('linked');

console.log(key);

//   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
// add in libraries=places&v=weekly

let script = '<script src="https://maps.googleapis.com/maps/api/js?key=' + key +'&callback=initMap&libraries=places&v=weekly" async defer >';

console.log(script);


$(document).ready(function(){
    $('body').append(script);
})

function initMap(){

    $('#startDate').datepicker({
        //date format formats the date
        dateFormat: 'dd-mm-yy',
        // lets us change the month
        changeMonth: true,
        minDate: new Date(),
        maxDate: '+1y',
        onSelect: function(date){
            let selectDate = new Date(date);
            // ms in a day
            let msInADay = 86400000;
            let stDate = new Date(selectDate.getTime() + msInADay);

            $('#endDate').datepicker('option', 'minDate', stDate);
            let endDate = new Date(selectDate.getTime() + 10 * msInADay)

            $('#endDate').datepicker('option', 'maxDate', endDate)
        }
    });

    $('#endDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true
    });

    $('#calculateDays').click(function(){
        dateDiff();
    });


    function dateDiff(){
        let start = $(startDate).datepicker('getDate');
        let end = $(endDate).datepicker('getDate');

        // calculation to get readable days
        let days = (end - start)/1000/60/60/24;
        $('#days').val(days);
    }


    // auto complete form
    let start = new google.maps.places.Autocomplete(
        document.getElementById('start'),
        {
            types: ['(cities)']
        }
    ); // auto complete start

    let end = new google.maps.places.Autocomplete(
        document.getElementById('end'),
        {
            types: ['(cities)']
        }
    );


    // directions distance and duration
    // initiate a direction request to the Direction service
    // https://developers.google.com/maps/documentation/javascript/directions
    const directionService = new google.maps.DirectionsService();

    // direction service renderer handles the display of lines and any associated markers
    const directionsRenderer = new google.maps.DirectionsRenderer();


    // calling the map function

    const map = new google.maps.Map(document.getElementById('map'),{
        zoom: 6,
        center: {lat:-43.49897589664995, lng:171.6491313044863},
        mapTypeId: 'satellite'
    });

    directionsRenderer.setMap(map);

    document.getElementById('submit').addEventListener('click', () => {
        calculateAndDisplayRoute(directionService, directionsRenderer)
    });





}


function calculateAndDisplayRoute(directionService, directionsRenderer){
    // console.log(directionService);
    // console.log(directionsRenderer);
    const waypts = [];
    const checkboxArray = document.getElementById('waypoints');

    for (let i = 0; i < checkboxArray.length; i++){
        if(checkboxArray.options[i].selected){
            waypts.push({
                // gets the lat and lng in degrees, contains one lat and lng subfield
                // https://developers.google.com/maps/documentation/geolocation/overview
                location: checkboxArray[i].value,
                // stop over is boolean and it indicates a stop over on the route
                stopover: true,
            });
        }
    }
    console.log(waypts);

    // need to make a request to get the distance
    // directionService
    // this routes out the direction of selected locations
    
    directionService.route({
        // specifies the start location from which to calculate directions
        origin: document.getElementById('start').value,
        // destination specifies the end location
        destination: document.getElementById('end').value,
        // way points specifies an array of directions which are way points
        // way points alter the route
        waypoints: waypts,
        // to specify more efficent order of travel we need to rearrange our waypoints
        optimizeWaypoints: true,
        // specify what mode of travel
        // https://developers.google.com/maps/documentation/javascript/examples/directions-travel-modes
        travelMode: google.maps.TravelMode.DRIVING,

    },
        (response, status) =>{
            // the ok indicated that no errors have occured
            if(status === "OK"){
                // here we can check that everything is ok
                console.log(response);
                // geocoding
                // https://developers.google.com/maps/documentation/javascript/geocoding
                // creates the render of the given directions
                // https://developers.google.com/maps/documentation/javascript/reference/directions            
                directionsRenderer.setDirections(response);
                const route = response.routes[0];
                const summaryPanel = document.getElementById('directions-panel');

                summaryPanel.innerHTML = "";

                // for each route, display summary information
                for(let i = 0; i < route.legs.length; i++){
                    const routeSegment = i + 1;

                    summaryPanel.innerHTML +=
                    "<b>Route Segment:" + routeSegment + "</b><br>";
                    summaryPanel.innerHTML += route.legs[i].start_address + " to ";
                    summaryPanel.innerHTML += route.legs[i].end_address + "<br>";
                    summaryPanel.innerHTML +=
                    route.legs[i].distance.text + " and it take " + route.legs[i].duration.text + " to reach." + "<br><br>";
                }

            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );

}

$('#start,#end').click(function(){
    $(this).val("");
});