package visualization.dao.impl;

import java.io.Serializable;
import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;

import visualization.dao.ServerDao;
import visualization.model.Server;


public class ServerDaoImpl implements ServerDao, Serializable {

	private static final long serialVersionUID = 1L;
	private SessionFactory sessionFactory;

	public ServerDaoImpl() {

	}

	public ServerDaoImpl(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}

	private Session getSession() throws HibernateException {
		return sessionFactory.openSession();
	}

	// retrieves list of all servers found in the DB
	@Override
	public List<Server> getAllServers() {
		List<Server> serverList = null;
		Session session = getSession();
		try {
			Criteria criteria = session.createCriteria(Server.class);
			serverList = criteria.list();
			session.flush();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return serverList;
	}

	// adds a server to the DB or updates it
	@Override
	public void addOrUpdateServer(Server server) {
		Session session = getSession();
		Transaction transaction = null;
		try {
			transaction = session.getTransaction();
			transaction.begin();
			session.saveOrUpdate(server);
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			transaction.commit();
		}
	}

	// gets server from DB based on ID
	@Override
	public Server getServer(long id) {
		List<Server> serverList = null;
		Session session = getSession();
		try {
			Criteria criteria = session.createCriteria(Server.class);
			criteria.add(Restrictions.eq("id", id));
			serverList = criteria.list();
			session.flush();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return serverList.get(0);
	}

	@Override
	public Server getServer(String name) {
		List<Server> serverList = null;
		Session session = getSession();
		try {
			Criteria criteria = session.createCriteria(Server.class);
			criteria.add(Restrictions.eq("name", name));
			serverList = criteria.list();
			session.flush();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return serverList.get(0);
	}

}
