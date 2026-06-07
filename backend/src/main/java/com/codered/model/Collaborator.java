package com.codered.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "collaborators")
@Data
@NoArgsConstructor
public class Collaborator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;
    private String address;
    private Double latitude;
    private Double longitude;
    private String reach;
    private int score;

    // "Companies", "Schools", or "Community Groups"
    @Column(nullable = false)
    private String category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "collaborator_tags", joinColumns = @JoinColumn(name = "collaborator_id"))
    @Column(name = "tag")
    private List<String> tags;
}
