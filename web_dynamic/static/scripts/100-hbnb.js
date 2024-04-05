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
        console.log("Checkbox changed");
        if ($(this).is(':checked')) {
            if ($(this).parent().parent().hasClass('states')) {
                states[$(this).data('id')] = $(this).data('name');
                console.log("State selected:", $(this).data('name'));
            } else if ($(this).parent().parent().hasClass('cities')) {
                cities[$(this).data('id')] = $(this).data('name');
                console.log("City selected:", $(this).data('name'));
            }
        } else {
            if ($(this).parent().parent().hasClass('states')) {
                delete states[$(this).data('id')];
                console.log("State deselected:", $(this).data('name'));
            } else if ($(this).parent().parent().hasClass('cities')) {
                delete cities[$(this).data('id')];
                console.log("City deselected:", $(this).data('name'));
            }
        }

        const locationsList = [...Object.values(states), ...Object.values(cities)].join(', ');
        console.log("Locations list:", locationsList);
        $('.locations h4').text(locationsList);
    });

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
            const placesSection = $('section.places');
            console.log("Places search successful:", data);
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
