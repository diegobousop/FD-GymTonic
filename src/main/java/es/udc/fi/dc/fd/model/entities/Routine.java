package es.udc.fi.dc.fd.model.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;

@Entity
public class Routine {
    private Long id;
    private String name;
    private List<RoutineExercise> routineExercises = new ArrayList<>();
    private Users creator;
    private Long duration; // Duration in minutes
    private LocalDateTime modificationDate;
    private Boolean isPublic; // true = public, false = private
    private Difficulty difficulty;

     public enum Difficulty {
        FACIL,       // 0
        INTERMEDIO,  // 1
        DIFICIL      // 2
    };

    public Routine() {
    }

    public Routine(Long id) {
        this.id = id;
    }
    public Routine(String name, List<RoutineExercise> routineExercises, Users creator, Long duration, LocalDateTime modificationDate, Boolean isPublic) {
        this.name = name;
        this.routineExercises = routineExercises;
        this.creator = creator;
        this.duration = duration;
        this.modificationDate = modificationDate;
        this.isPublic = isPublic;
    }

    public Routine(Long id, String name, List<RoutineExercise> routineExercises, Users creator, Long duration, LocalDateTime modificationDate, Boolean isPublic) {
        this.name = name;
        this.routineExercises = routineExercises;
        this.creator = creator;
        this.duration = duration;
        this.modificationDate = modificationDate;
        this.isPublic = isPublic;
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderInRoutine ASC")
    public List<RoutineExercise> getRoutineExercises() {
        return routineExercises; 
    }
    public void setRoutineExercises(List<RoutineExercise> routineExercises) { 
        this.routineExercises = routineExercises; 
    }

    @ManyToOne
    @JoinColumn(name = "creator")
    public Users getCreator() {
        return creator;
    }

    public void setCreator(Users creator) {
        this.creator = creator;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public LocalDateTime getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(LocalDateTime modificationDate) {
        this.modificationDate = modificationDate;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
}
