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
                states[$(this).data('id')] = $(this).data('name');               
                // Log selected state details
                console.log("State selected - ID:", stateId, "Name:", stateName);

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
		delete states[$(this).data('id')];
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

  function loadPlaces (placesSection, data) {
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
                          <div class="reviews" id="${place.id}">
                            <h2>
                              <span class="reviews-h">Reviews</span>
                              <span id="${place.id}" class="visibility"> Show</span>
                            </h2>
                          </div>
                      </article>`;
        placesSection.append(article);
      });
  }

  $(document).on('click', '.visibility', function () {
    const id = $(this).attr('id');
    if ($(this).text() === ' Show') {
      $(this).text(' Hide');
      $.ajax({
        type: 'GET',
        url: 'http://0.0.0.0:5001/api/v1/places/' + id + '/reviews',
        success: (reviews) => {
          const reviewCount = Object.keys(reviews).length;

          $('div#' + id + ' h2 .reviews-h').prepend(reviewCount + ' ');

          $.each(reviews, (index, review) => {
            const date = review.created_at.split('T')[0];

            $.ajax({
              type: 'GET',
              url: 'http://0.0.0.0:5001/api/v1/users/' + review.user_id,
              success: (user) => {
                $('div#' + id).append(
                  `<ul>
                  <li>
                  <h3>From ${user.first_name} ${user.last_name}, ${date}</h3>
                  <p>${review.text}</p>
                  </li>
                  </ul>`
                );
              }
            });
          });
        }
      });
    } else {
      $('div#' + id + ' h2 .reviews-h').text('Reviews');
      $(this).text(' Show');
      $('div#' + id + ' ul').empty();
    }
  });

  $.ajax({
      type: 'POST',
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      contentType: 'application/json',
      data: JSON.stringify({}),
      success: function (data) {
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
