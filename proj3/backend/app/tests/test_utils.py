from app.routes.meal_routes import calculate_distance

def test_calculate_distance_same_point():
    # Distance between the same point should be 0
    lat1, lon1 = 35.7796, -78.6382  # Raleigh, NC
    assert calculate_distance(lat1, lon1, lat1, lon1) == 0

def test_calculate_distance_known_values():
    # Distance between Raleigh, NC and Durham, NC is ~24 miles
    lat1, lon1 = 35.7796, -78.6382  # Raleigh, NC
    lat2, lon2 = 35.9940, -78.8986  # Durham, NC
    distance = calculate_distance(lat1, lon1, lat2, lon2)
    assert 20.0 < distance < 21.0

def test_calculate_distance_long_distance():
    # Distance between Raleigh, NC and Los Angeles, CA is ~2200 miles
    lat1, lon1 = 35.7796, -78.6382  # Raleigh, NC
    lat2, lon2 = 34.0522, -118.2437 # Los Angeles, CA
    distance = calculate_distance(lat1, lon1, lat2, lon2)
    assert 2230.0 < distance < 2235.0

def test_calculate_distance_zero_lat_lon():
    distance = calculate_distance(0, 0, 1, 1)
    # Distance should be approx 97.5 miles
    assert 97 < distance < 98
