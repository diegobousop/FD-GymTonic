package es.udc.fi.dc.fd.model.entities;

import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SerieDao extends JpaRepository<Serie, Long> {

    Slice<Serie> findByExercise (Exercise exercise );

    Slice<Serie> findByExercise_ExerciseName(String exerciseName);
}
