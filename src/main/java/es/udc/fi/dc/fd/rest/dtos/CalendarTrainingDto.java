package es.udc.fi.dc.fd.rest.dtos;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

public class CalendarTrainingDto {
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String title;

    public CalendarTrainingDto(LocalDate date, String title) {
        this.date = date;
        this.title = title;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getTitle() {
        return title;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setTitle(String title) {
        this.title = title;
    }

}
