$(document).ready(function () {
    const amenities = {};
    const states = {};
    const cities = {};

    $('.amenities input[type="checkbox"]').change(function () {
        if ($(this).is(':checked')) {
            amenities[$(this).data('id')] = $(this).data('name');
        } else {
            delete amenities[$(this).data('id')];
        }

        const amenitiesList = Object.values(amenities).join(', ');
        $('.amenities h4').text(amenitiesList);
    });

    $('.locations input[type="checkbox"]').change(function () {
        const checkboxContainer = $(this).parent().parent();
        const isChecked = $(this).is(':checked');
        const checkboxType = checkboxContainer.hasClass('states') ? 'state' : 'city';
        const checkboxId = $(this).data('id');
        const checkboxName = $(this).data('name');

        if (isChecked) {
          if (checkboxType === 'state') {
              states[checkboxId] = checkboxName;
              console.log("State selected:", checkboxName);
          } else if (checkboxType === 'city') {
              cities[checkboxId] = checkboxName;
              console.log("City selected:", checkboxName);
          }
        } else {
            if (checkboxType === 'state') {
               delete states[checkboxId];
               console.log("State deselected:", checkboxName);
            } else if (checkboxType === 'city') {
               delete cities[checkboxId];
               console.log("City deselected:", checkboxName);
            }
        }
    });


    function updateLocationsList() {
        const statesList = Object.values(states).join(', ');
        const citiesList = Object.values(cities).join(', ');
        const locationsList = [statesList, citiesList].filter(Boolean).join(', ');
        console.log("Locations list:", locationsList);
        $('.locations h4').text(locationsList);
    }

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

    $.get('http://0.0.0.0:5001/api/v1/status/', (data) => {
        const apiStatus = $('div#api_status');

        if (data.status === 'OK') {
            apiStatus.addClass('available');
        } else {
            apiStatus.removeClass('available');
        }
    });

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
