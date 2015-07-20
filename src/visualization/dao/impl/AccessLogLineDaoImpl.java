package visualization.dao.impl;

import java.io.Serializable;
import java.util.Date;
import java.util.List;


import org.hibernate.Criteria;
import org.hibernate.FetchMode;
import org.hibernate.FlushMode;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Disjunction;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Property;
import org.hibernate.criterion.Restrictions;

import visualization.dao.AccessLogLineDao;
import visualization.model.AccessLogLine;
import visualization.model.InternalLogLine;
import visualization.model.LogLine;
import visualization.model.Server;


public class AccessLogLineDaoImpl extends AccessLogLineDao implements
		Serializable {

	private static final long serialVersionUID = 1L;

	public AccessLogLineDaoImpl() {
		super();
	}

	private Session getSession() throws HibernateException {
		return sessionFactory.openSession();
	}

	public AccessLogLineDaoImpl(SessionFactory sessionFactory) {
		super(sessionFactory);
	}

	public List<String> getAllHttpCodes() {
		List<String> codeList = null;
		Session session = getSession();
		try {
			session.setFlushMode(FlushMode.AUTO);
			Criteria criteria = session.createCriteria(AccessLogLine.class);
			criteria.setProjection(Projections.projectionList().add(
					Projections.groupProperty("code")));
			codeList = criteria.list();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return codeList;
	}
	
	public List<?> getTreeChartData() {
		List<?> data = null;
		Session session = getSession();
		try {
			session.setFlushMode(FlushMode.AUTO);
			Criteria criteria = session.createCriteria(AccessLogLine.class);
			criteria.createAlias("server", "s").setProjection(
					Projections.projectionList().add(Projections.rowCount())
							.add(Projections.groupProperty("url")));
			criteria.addOrder(Order.asc("url"));
			data = criteria.list();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return data;
	}

	public List<?> getPlotChartData() {
		List<?> data = null;
		Session session = getSession();
		try {
			session.setFlushMode(FlushMode.AUTO);
			Criteria criteria = session.createCriteria(AccessLogLine.class);
			criteria.createAlias("server", "s").setProjection(
					Projections.projectionList().add(Projections.rowCount())
							.add(Projections.groupProperty("timestamp"))
							.add(Projections.groupProperty("url")));
			data = criteria.list();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return data;
	}

	public List<?> getPlotChartData(Date currentDate) {
		Date beforeDate = new Date(currentDate.getTime() - 15000);
		List<?> data = null;
		Session session = getSession();
		try {
			session.setFlushMode(FlushMode.AUTO);
			Criteria criteria = session.createCriteria(AccessLogLine.class);
			criteria.add(
					Restrictions.between("timestamp", beforeDate, currentDate))
					.createAlias("server", "s")
					.setProjection(
							Projections
									.projectionList()
									.add(Projections.rowCount())
									.add(Projections.groupProperty("timestamp"))
									.add(Projections.groupProperty("url")))
					.addOrder(Order.asc("timestamp"));
			data = criteria.list();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return data;
	}

	public List<?> getBarChartData() {
		List<?> data = null;
		Session session = getSession();
		try {
			session.setFlushMode(FlushMode.AUTO);
			Criteria criteria = session.createCriteria(AccessLogLine.class);
			criteria.createAlias("server", "s").setProjection(
					Projections.projectionList().add(Projections.rowCount())
							.add(Projections.groupProperty("code"))
							.add(Projections.groupProperty("s.name")));
			data = criteria.list();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return data;
	}

	@Override
	public List<AccessLogLine> getAllLogLines() {
		List<AccessLogLine> accessLogLineList = null;
		Session session = getSession();
		try {
			session.setFlushMode(FlushMode.AUTO);
			Criteria criteria = session.createCriteria(AccessLogLine.class);
			accessLogLineList = criteria.list();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		return accessLogLineList;
	}

	public List<?> getLogLinesRange(Date start, Date end, String chartFormat,
			Long size, String sizeComparison, String[] urlParams,
			String[] httpCodes, String[] servers, String startIp, String endIp) {

		List<?> accessLogLineList = null;
		Session session = getSession();
		Disjunction urlDisjunction = Restrictions.disjunction();
		Disjunction codeDisjunction = Restrictions.disjunction();
		
		//System.out.println(start + " "+ end);
		
		try {
			session.setFlushMode(FlushMode.AUTO);
			Criteria criteria = session.createCriteria(AccessLogLine.class)
					.add(Restrictions.between("timestamp", start, end));
			if (startIp != null && !startIp.equals("") && endIp != null && !endIp.equals("")) {
				criteria.add(Restrictions.between("ip", startIp, endIp));
			}
			// we add size comparison restrictions
			if (sizeComparison != null && size != null) {
				if (sizeComparison.equals("at least")) {
					criteria.add(Restrictions.ge("size", size));
				} else if (sizeComparison.equals("exactly")) {
					criteria.add(Restrictions.eq("size", size));
				} else {
					criteria.add(Restrictions.le("size", size));
				}
			}
			
			// we add url parameter restrictions
			if (urlParams != null && !urlParams[0].equals("")) {
				for (String s : urlParams) {
					urlDisjunction.add(Restrictions.like("url", "%" + s + "%"));
				}
				criteria.add(urlDisjunction);
			}
			
			// we add http code restrictions
			if (httpCodes != null && !httpCodes[0].equals("")) {
				for (String s : httpCodes) {
					codeDisjunction.add(Restrictions
							.like("code", "%" + s + "%"));
				}
				criteria.add(codeDisjunction);
			}
			
			// we add server restrictions (must put this last as it is the last
			// thing to be joined!!!!)
			if (servers != null && !servers[0].equals("")) {
				Disjunction serverDisjunction = Restrictions.disjunction();
				for (String s : servers) {
					serverDisjunction.add(Restrictions.eq("name", s));
				}
				criteria.createCriteria("server").add(serverDisjunction);
			}
			if(chartFormat.equals("plot")) {
				criteria.setProjection(
						Projections
								.projectionList()
								.add(Projections.rowCount())
								.add(Projections.groupProperty("timestamp"))
								.add(Projections.groupProperty("url")))
				.addOrder(Order.asc("timestamp"));
			} else if(chartFormat.equals("tree")) {
				criteria.setProjection(
						Projections
								.projectionList()
								.add(Projections.rowCount())
								.add(Projections.groupProperty("url")))
				.addOrder(Order.asc("url"));
			}
			accessLogLineList = criteria.list();
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			session.close();
		}
		System.out.println("Returned "+accessLogLineList.size() +" rows");
		return accessLogLineList;
	}

	@Override
	public List<AccessLogLine> getLogLinesRange(Date start, Date end) {
		List<AccessLogLine> accessLogLineList = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(AccessLogLine.class);
		criteria.add(Restrictions.between("timestamp", start, end));
		accessLogLineList = criteria.list();
		session.flush();
		session.close();
		System.out.println("Returned "+accessLogLineList.size() +" rows");
		return accessLogLineList;
	}

	@Override
	public List<? extends LogLine> getAllLogLines(Date date) {
		List<AccessLogLine> accessLogLineList = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(AccessLogLine.class);
		criteria.add(Restrictions.ge("timestamp", date))
		.addOrder(Order.asc("ip"))
		.addOrder(Order.asc("url"));
		accessLogLineList = criteria.list();
		session.flush();
		session.close();
		System.out.println("Returned "+accessLogLineList.size() +" rows");
		return accessLogLineList;
	}
}
