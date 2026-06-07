package com.codered.repository;

import com.codered.model.Collaborator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollaboratorRepository extends JpaRepository<Collaborator, Long> {
    List<Collaborator> findByCategory(String category);
    boolean existsByName(String name);
}
