package es.udc.fi.dc.fd.rest.dtos;

public class SearchSuggestionDto {
    private Long id;
    private String type;
    private String name;

    public SearchSuggestionDto() {}

    public SearchSuggestionDto(Long id, String type, String name) {
        this.id = id;
        this.type = type;
        this.name = name;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }


    @Override
    public boolean equals(Object objeto){
        SearchSuggestionDto search = (SearchSuggestionDto) objeto;
        if(this.id == search.getId()){
            return true;
        }else{
            return false;
        }
    }
}
