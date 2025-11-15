package es.udc.fi.dc.fd.model.entities;

import java.util.List;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
public class SearchDaoImpl implements SearchDao {

    @PersistenceContext
    private EntityManager entityManager;

    // Sugerencias rápidas para la SearchBar
    @Override
    @SuppressWarnings("unchecked")
    public List<Object[]> findUserSuggestions(String text, int limit) {
        return (List<Object[]>) entityManager
                .createQuery("SELECT u.id, u.userName FROM Users u " +
                        "WHERE LOWER(u.userName) LIKE LOWER(CONCAT('%', :text, '%'))")
                .setParameter("text", text)
                .setMaxResults(limit)
                .getResultList();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Object[]> findRoutineSuggestions(String text, int limit) {
        return (List<Object[]>) entityManager
                .createQuery("SELECT r.id, r.name FROM Routine r " +
                        "WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :text, '%'))")
                .setParameter("text", text)
                .setMaxResults(limit)
                .getResultList();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Object[]> findExerciseSuggestions(String text, int limit) {
        return (List<Object[]>) entityManager
                .createQuery("SELECT e.id, e.exerciseName FROM Exercise e " +
                        "WHERE LOWER(e.exerciseName) LIKE LOWER(CONCAT('%', :text, '%'))")
                .setParameter("text", text)
                .setMaxResults(limit)
                .getResultList();
    }

    // Búsqueda completa para la SearchPage
    @Override
    public List<Users> findUsersDetailed(String text, int limit) {
        return entityManager
                .createQuery("SELECT u FROM Users u " +
                        "WHERE LOWER(u.userName) LIKE LOWER(CONCAT('%', :text, '%'))", Users.class)
                .setParameter("text", text)
                .setMaxResults(limit)
                .getResultList();
    }

    @Override
    public List<Routine> findRoutinesDetailed(String text, int limit) {
        return entityManager
                .createQuery("SELECT r FROM Routine r " +
                        "WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :text, '%'))", Routine.class)
                .setParameter("text", text)
                .setMaxResults(limit)
                .getResultList();
    }

    @Override
    public List<Exercise> findExercisesDetailed(String text, int limit) {
        return entityManager
                .createQuery("SELECT e FROM Exercise e " +
                        "WHERE LOWER(e.exerciseName) LIKE LOWER(CONCAT('%', :text, '%'))", Exercise.class)
                .setParameter("text", text)
                .setMaxResults(limit)
                .getResultList();
    }
}