package es.udc.fi.dc.fd.rest.dtos;

public class SerieSummaryDto {
    private Long id;
    private int numeroSerie;
    private int repeticiones;
    private int peso;

    public SerieSummaryDto() {}

    public SerieSummaryDto(Long id, int numeroSerie, int repeticiones, int peso) {
        this.id = id;
        this.numeroSerie = numeroSerie;
        this.repeticiones = repeticiones;
        this.peso = peso;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(int numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public int getRepeticiones() {
        return repeticiones;
    }

    public void setRepeticiones(int repeticiones) {
        this.repeticiones = repeticiones;
    }

    public int getPeso() {
        return peso;
    }
    public void setPeso(int peso) {
        this.peso = peso;
    }
}
