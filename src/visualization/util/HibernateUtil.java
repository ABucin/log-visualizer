package visualization.util;

import org.hibernate.HibernateException;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.service.ServiceRegistryBuilder;

public class HibernateUtil {

	private static ServiceRegistry serviceRegistry;
	private static final SessionFactory SESSION_FACTORY;
	
	static {
		try {
			final Configuration cfg = new Configuration();
			cfg.configure("hibernate.cfg.xml");
			serviceRegistry = new ServiceRegistryBuilder().applySettings(cfg.getProperties()).buildServiceRegistry();
			SESSION_FACTORY = cfg.buildSessionFactory(serviceRegistry);
		} catch (HibernateException ex) {
			throw new ExceptionInInitializerError(ex);
		}
	}
	
	public SessionFactory getSessionFactory() {
		return SESSION_FACTORY;
	}
}
