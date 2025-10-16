package es.udc.fi.dc.fd.rest.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.services.SearchService;
import es.udc.fi.dc.fd.rest.dtos.SearchFullDto;
import es.udc.fi.dc.fd.rest.dtos.SearchSuggestionDto;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/suggestions")
    public ResponseEntity<List<SearchSuggestionDto>> getSuggestions(
            @RequestParam(required = false) String text,
            @RequestParam(defaultValue = "2") int limit) {

        if (text == null || text.isBlank()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(searchService.findSuggestions(text.trim(), limit));
    }

    @GetMapping("/full")
    public ResponseEntity<Map<String, List<SearchFullDto>>> getFullResults(
            @RequestParam(required = false) String text,
            @RequestParam(required = false) String trainerName,
            @RequestParam(required = false) String muscleGroup,
            @RequestParam(defaultValue = "20") int limit) {

        if (text == null || text.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "users", List.of(),
                    "routines", List.of(),
                    "exercises", List.of()
            ));
        }

        return ResponseEntity.ok(
                searchService.findFullResults(text.trim(), trainerName, muscleGroup, limit)
        );
    }
}

