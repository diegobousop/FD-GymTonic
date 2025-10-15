package es.udc.fi.dc.fd.model.services.exceptions;

@SuppressWarnings("serial")
public class PermissionException extends Exception {
    public PermissionException(String name, Object key) {
        super(name + ": " + key);
    }
}
