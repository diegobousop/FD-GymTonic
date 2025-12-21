package es.udc.fi.dc.fd.model.entities;

import java.util.List;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

@Repository
public class SearchDaoImpl implements SearchDao {

    @PersistenceContext
    private EntityManager entityManager;

    // -------------------------------------------------------------
    // Sugerencias rápidas para la SearchBar
    // -------------------------------------------------------------
    @Override
    public List<Object[]> findUserSuggestions(String text, int limit) {
        TypedQuery<Object[]> query = entityManager.createQuery(
                "SELECT u.id, u.userName FROM Users u " +
                "WHERE LOWER(u.userName) LIKE LOWER(CONCAT('%', :text, '%'))",
                Object[].class
        );
        query.setParameter("text", text);
        query.setMaxResults(limit + 10);
        return query.getResultList();
    }

    @Override
    public List<Object[]> findRoutineSuggestions(String text, int limit) {
        TypedQuery<Object[]> query = entityManager.createQuery(
                "SELECT r.id, r.name FROM Routine r " +
                "WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :text, '%'))",
                Object[].class
        );
        query.setParameter("text", text);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public List<Object[]> findExerciseSuggestions(String text, int limit) {
        TypedQuery<Object[]> query = entityManager.createQuery(
                "SELECT e.id, e.exerciseName FROM Exercise e " +
                "WHERE LOWER(e.exerciseName) LIKE LOWER(CONCAT('%', :text, '%'))",
                Object[].class
        );
        query.setParameter("text", text);
        query.setMaxResults(limit);
        return query.getResultList();
    }


    // -------------------------------------------------------------
    // Búsqueda completa
    // -------------------------------------------------------------
    @Override
    public List<Users> findUsersDetailed(String text, int limit) {
        TypedQuery<Users> query = entityManager.createQuery(
                "SELECT u FROM Users u " +
                        "WHERE LOWER(u.userName) LIKE LOWER(CONCAT('%', :text, '%'))",
                Users.class
        );
        query.setParameter("text", text);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public List<Routine> findRoutinesDetailed(String text, int limit) {
        TypedQuery<Routine> query = entityManager.createQuery(
                "SELECT r FROM Routine r " +
                        "WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :text, '%'))",
                Routine.class
        );
        query.setParameter("text", text);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public List<Routine> findRoutinesDetailedIncludingExercise(String text, int limit) {
        TypedQuery<Routine> query = entityManager.createQuery(
                """
                SELECT DISTINCT r
                FROM Routine r
                LEFT JOIN r.routineExercises re
                LEFT JOIN re.exercise e
                WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :text, '%'))
                   OR LOWER(e.exerciseName) LIKE LOWER(CONCAT('%', :text, '%'))
                """,
                Routine.class
        );
        query.setParameter("text", text);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public List<Exercise> findExercisesDetailed(String text, int limit) {
        TypedQuery<Exercise> query = entityManager.createQuery(
                "SELECT e FROM Exercise e " +
                        "WHERE LOWER(e.exerciseName) LIKE LOWER(CONCAT('%', :text, '%'))",
                Exercise.class
        );
        query.setParameter("text", text);
        query.setMaxResults(limit);
        return query.getResultList();
    }
}
