$(document).ready(function () {
    const amenities = {};
    const states = {};
    const cities = {};

    // Function to update the list of selected locations
    function updateLocationsList() {
        const statesList = Object.values(states).join(', ');
        const citiesList = Object.values(cities).join(', ');
        const locationsList = [statesList, citiesList].filter(Boolean).join(', ');
        console.log("Locations list:", locationsList);
        $('.locations h4').text(locationsList);
    }

    // Event handler for amenities checkboxes
    $('.amenities input[type="checkbox"]').change(function () {
        if ($(this).is(':checked')) {
            amenities[$(this).data('id')] = $(this).data('name');
        } else {
            delete amenities[$(this).data('id')];
        }

        const amenitiesList = Object.values(amenities).join(', ');
        $('.amenities h4').text(amenitiesList);
    });

    // Event handler for locations checkboxes (states and cities)
    $('.locations input[type="checkbox"]').change(function () {
        console.log("Checkbox changed");
        const checkboxContainer = $(this).parent().parent();
        const checkboxType = checkboxContainer.hasClass('states') ? 'state' : 'city';

        if ($(this).is(':checked')) {
            if (checkboxType === 'state') {
                const stateId = $(this).data('id');
                const stateName = $(this).data('name');
                
                // Log selected state details
                console.log("State selected - ID:", stateId, "Name:", stateName);

                // Filter cities that belong to the selected state
                const citiesInState = Object.values(citiesData).filter(city => city.state_id === stateId);
                
                // Add cities in the selected state to the cities object
                citiesInState.forEach(city => {
                    cities[city.id] = city.name;
                    console.log("City selected:", city.name, "ID:", city.id, "State ID:", city.state_id);
                });

                // Update locations list display
                updateLocationsList();
            } else if (checkboxType === 'city') {
                cities[$(this).data('id')] = $(this).data('name');
                console.log("City selected:", $(this).data('name'), "ID:", $(this).data('id'));
                
                // Update locations list display
                updateLocationsList();
            }
        } else {
            if (checkboxType === 'state') {
                const stateId = $(this).data('id');
                const stateName = $(this).data('name');
                
                // Remove cities belonging to the deselected state from the cities object
                Object.entries(cities).forEach(([cityId, cityName]) => {
                    const city = citiesData[cityId];
                    if (city.state_id === stateId) {
                        delete cities[cityId];
                        console.log("City deselected:", cityName);
                    }
                });

                // Log deselected state details
                console.log("State deselected - ID:", stateId, "Name:", stateName);

                // Update locations list display
                updateLocationsList();
            } else if (checkboxType === 'city') {
                delete cities[$(this).data('id')];
                console.log("City deselected:", $(this).data('name'), "ID:", $(this).data('id'));
                
                // Update locations list display
                updateLocationsList();
            }
        }
    });

    // Function to load places data
    function loadPlaces(placesSection, data) {
        data.forEach(place => {
            const article = `<article>
                                <div class="title_box">
                                    <h2>${place.name}</h2>
                                    <div class="price_by_night">$${place.price_by_night}</div>
                                </div>
                                <div class="information">
                                    <div class="max_guest">${place.max_guest} Guests</div>
                                    <div class="number_rooms">${place.number_rooms} Bedrooms</div>
                                    <div class="number_bathrooms">${place.number_bathrooms} Bathrooms</div>
                                </div>
                                <div class="description">${place.description}</div>
                            </article>`;
            placesSection.append(article);
        });
    }

    // AJAX request to fetch places data
    $.ajax({
        type: 'POST',
        url: 'http://0.0.0.0:5001/api/v1/places_search/',
        contentType: 'application/json',
        data: JSON.stringify({}),
        success: function (data) {
            console.log("Places search successful:", data);
            const placesSection = $('section.places');
            loadPlaces(placesSection, data);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching places:', error);
        }
    });

    // Check API status
    $.get('http://0.0.0.0:5001/api/v1/status/', (data) => {
        const apiStatus = $('div#api_status');
        if (data.status === 'OK') {
            apiStatus.addClass('available');
        } else {
            apiStatus.removeClass('available');
        }
    });

    // Event handler for search button click
    $('button').on('click', () => {
        console.log("Search button clicked");
        $.ajax({
            type: 'POST',
            url: 'http://0.0.0.0:5001/api/v1/places_search/',
            contentType: 'application/json',
            data: JSON.stringify({
                amenities: Object.keys(amenities),
                states: Object.keys(states),
                cities: Object.keys(cities)
            }),
            success: function (data) {
                console.log("Places search successful:", data);
                const placesSection = $('section.places');
                placesSection.empty();
                loadPlaces(placesSection, data);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching places:', error);
            }
        });
    });
});

