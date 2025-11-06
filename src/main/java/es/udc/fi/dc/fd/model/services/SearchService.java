package es.udc.fi.dc.fd.model.services;

import java.util.List;
import java.util.Map;

import es.udc.fi.dc.fd.rest.dtos.SearchFullDto;
import es.udc.fi.dc.fd.rest.dtos.SearchSuggestionDto;

public interface SearchService {

    // Búsqueda rápida para la SearchBar
    List<SearchSuggestionDto> findSuggestions(String text, int limitPerType);
    
    // Búsqueda rápida con información del buscador
    List<SearchSuggestionDto> findSuggestions(String text, int limitPerType, Long searcherUserId);

    // Búsqueda completa para la página de resultados
    Map<String, List<SearchFullDto>> findFullResults(String text, String trainerName, String muscleGroup, int limit);
    
    // Búsqueda completa con información del buscador
    Map<String, List<SearchFullDto>> findFullResults(String text, String trainerName, String muscleGroup, int limit, Long searcherUserId);
}
