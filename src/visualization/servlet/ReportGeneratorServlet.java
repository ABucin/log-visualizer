package visualization.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import visualization.dao.LogLineDao;
import visualization.dao.ServerDao;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.dao.impl.InternalLogLineDaoImpl;
import visualization.dao.impl.ServerDaoImpl;
import visualization.model.InternalLogLine;
import visualization.model.Server;
import visualization.util.HibernateUtil;


@WebServlet("/ReportGeneratorServlet")
public class ReportGeneratorServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private final DateFormat dateFormat = new SimpleDateFormat(
			"EEE MMM dd kk:mm:ss yyyy");

	private final HibernateUtil hibernateUtil;
	private LogLineDao logLineDao;
	private ServerDao serverDao;

	public ReportGeneratorServlet() {
		super();
		hibernateUtil = new HibernateUtil();
	}

	protected void doPost(final HttpServletRequest request,
			final HttpServletResponse response) throws ServletException, IOException {

		final String query = request.getParameter("query");

		String data = null;
		final PrintWriter out = response.getWriter();

		if (query != null) {
			data = fetchQueryResult(query);
		} else {
			String type = request.getParameter("type");
			String startDate = request.getParameter("start_date");
			String endDate = request.getParameter("end_date");
			Long size = null;
			if (!request.getParameter("size").equals("")) {
				size = Long.parseLong(request.getParameter("size"));
			}
			String[] urlParams = null;
			if(request.getParameter("url_params")!=null) {
				urlParams = request.getParameter("url_params").split(",");
			}
			String[] httpCodes = null;
			if(request.getParameter("http_codes")!=null) {
				httpCodes = request.getParameter("http_codes").split(",");
			}
			String[] servers = null;
			if(request.getParameter("servers")!=null) {
				servers = request.getParameter("servers").split(",");
			}
			String chartFormat = request.getParameter("chart_format");
			String sizeComparison = request.getParameter("size_compare");
			String startIp = request.getParameter("start_ip");
			String endIp = request.getParameter("end_ip");
			String[] messageTypes = request.getParameter("message_type")
					.split(",");
			String classText = request.getParameter("class_text");
			String messageText = request.getParameter("message_text");

			startDate = convertDate(startDate);
			endDate = convertDate(endDate);
			Date sd = null;
			Date ed = null;
			try {
				sd = dateFormat.parse(startDate);
				ed = dateFormat.parse(endDate);
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			data = fetchData(type, chartFormat, sd, ed, size, sizeComparison, urlParams,
					httpCodes, servers, startIp, endIp, messageTypes,
					classText, messageText);
		}

		//System.out.println(data);

		out.write(data);
	}

	// converts date received from client into date from DB
	private String convertDate(String date) {
		String finalDate = new String();
		int ix = date.indexOf(" GMT");
		date = date.substring(0, ix);
		int eix = date.lastIndexOf(" ");
		int six = eix - 4;
		finalDate = date.substring(0, six - 1) + date.substring(eix) + " "
				+ date.substring(six, eix);
		// System.out.println(finalDate);
		return finalDate;
	}

	// retrieves query result from DB
	private String fetchQueryResult(String query) {
		StringBuilder data = new StringBuilder();
		if (query.equals("http_codes_all")) {
			logLineDao = new AccessLogLineDaoImpl(
					hibernateUtil.getSessionFactory());
			List<String> lineList = ((AccessLogLineDaoImpl) logLineDao)
					.getAllHttpCodes();
			for (String s : lineList) {
				data.append(s + ",");
			}
		} else if (query.equals("servers_all")) {
			serverDao = new ServerDaoImpl(hibernateUtil.getSessionFactory());
			List<Server> lineList = serverDao.getAllServers();
			for (Server s : lineList) {
				data.append(s.getName() + ",");
			}
		}
		return data.toString();
	}

	// retrieves data directly from DB
	private String fetchData(String type, String chartFormat, Date start, Date end, Long size,
			String sizeComparison, String[] urlParams, String[] httpCodes,
			String[] servers, String startIp, String endIp,
			String[] messageTypes, String classText, String messageText) {
		
		StringBuilder data = new StringBuilder();
		if (type.equals("access")) {
			logLineDao = new AccessLogLineDaoImpl(
					hibernateUtil.getSessionFactory());
			List<?> lineList = ((AccessLogLineDaoImpl) logLineDao)
					.getLogLinesRange(start, end, chartFormat, size, sizeComparison,
							urlParams, httpCodes, servers, startIp, endIp);
			
			if(lineList != null) {
				if(chartFormat.equals("plot")) {
					for (Object o : lineList) {
						Object[] arr = ((Object[]) o);
						String tempDate = dateFormat.format(arr[1]);
						String newDate = tempDate.replaceFirst("EEST ", "");
						data.append(newDate + "," + arr[2] + "," + arr[0] + '\n');
					}
				} else if(chartFormat.equals("tree")) {
					for(Object o:lineList) {
						Object[] arr = ((Object[]) o);
						String tempPath = ((String) arr[1]);
						String token = null;
						if(tempPath.indexOf("?") > 0) {
							token = "?";
						} else {
							token = "HTTP";
						}
						String processedTempPath = tempPath.substring(tempPath.indexOf("/"), tempPath.indexOf(token) - 1);
						data.append(processedTempPath+","+arr[0]+'\n');
					}
				}
			} else {
				System.out.println("Line list is null!");
			} 
		} else if (type.equals("internal")) {
			logLineDao = new InternalLogLineDaoImpl(
					hibernateUtil.getSessionFactory());
			List<InternalLogLine> lineList = ((InternalLogLineDaoImpl) logLineDao)
					.getLogLinesRange(start, end, chartFormat, servers, messageTypes, classText, messageText);
			for (InternalLogLine l : lineList) {
				data.append(l.toString() + "\n");
			}
		}

		return data.toString();
	}

}
