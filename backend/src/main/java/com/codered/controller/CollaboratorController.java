package com.codered.controller;

import com.codered.dto.CollaboratorDto;
import com.codered.service.CollaboratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collaborators")
@RequiredArgsConstructor
public class CollaboratorController {

    private final CollaboratorService collaboratorService;

    // GET /api/collaborators?driveCode=DD-001              → all, grouped by category
    // GET /api/collaborators?driveCode=DD-001&category=Schools → filtered list
    @GetMapping
    public ResponseEntity<?> getCollaborators(
            @RequestParam(required = false) String driveCode,
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            List<CollaboratorDto> list = collaboratorService.getByCategory(category, driveCode);
            return ResponseEntity.ok(list);
        }
        Map<String, List<CollaboratorDto>> grouped = collaboratorService.getAllGrouped(driveCode);
        return ResponseEntity.ok(grouped);
    }
}
