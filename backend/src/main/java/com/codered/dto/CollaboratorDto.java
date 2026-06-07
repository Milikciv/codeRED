package com.codered.dto;

import com.codered.model.Collaborator;
import lombok.Getter;

import java.util.List;

@Getter
public class CollaboratorDto {

    private final Long id;
    private final String name;
    private final String email;
    private final String address;
    private final Double latitude;
    private final Double longitude;
    private final String reach;
    private final int score;
    private final String category;
    private final List<String> tags;
    private final String distance; // e.g. "1.2 km", null when no drive selected

    public CollaboratorDto(Collaborator c, Double driveLat, Double driveLng) {
        this.id       = c.getId();
        this.name     = c.getName();
        this.email    = c.getEmail();
        this.address  = c.getAddress();
        this.latitude = c.getLatitude();
        this.longitude= c.getLongitude();
        this.reach    = c.getReach();
        this.score    = c.getScore();
        this.category = c.getCategory();
        this.tags     = c.getTags();
        this.distance = (driveLat != null && driveLng != null && c.getLatitude() != null && c.getLongitude() != null)
            ? formatDistance(haversineKm(driveLat, driveLng, c.getLatitude(), c.getLongitude()))
            : null;
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private static String formatDistance(double km) {
        if (km < 1.0) return Math.round(km * 1000) + " m";
        return String.format("%.1f km", km);
    }
}
