-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add spatial index to workers table
CREATE INDEX idx_workers_location ON workers USING GIST (
  ST_MakePoint(longitude::double precision, latitude::double precision)::geography
);

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) *
      cos(radians(lat2)) *
      cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) *
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find nearby workers
CREATE OR REPLACE FUNCTION find_nearby_workers(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_km INTEGER DEFAULT 10,
  worker_trade VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  worker_id UUID,
  distance_km DECIMAL,
  full_name VARCHAR,
  trade VARCHAR,
  rating DECIMAL,
  hourly_rate INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    calculate_distance(user_lat, user_lon, w.latitude, w.longitude) as distance,
    u.full_name,
    w.trade,
    w.rating,
    w.hourly_rate
  FROM workers w
  JOIN users u ON w.user_id = u.id
  WHERE
    w.is_available = true
    AND w.latitude IS NOT NULL
    AND w.longitude IS NOT NULL
    AND (worker_trade IS NULL OR w.trade = worker_trade)
    AND calculate_distance(user_lat, user_lon, w.latitude, w.longitude) <= radius_km
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;
