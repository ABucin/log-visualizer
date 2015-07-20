package visualization.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import visualization.chart.impl.BarChart;
import visualization.chart.impl.PlotChart;
import visualization.chart.impl.TimelineChart;
import visualization.chart.impl.TreeChart;


@WebServlet("/AccessLineServlet")
public class AccessLineServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private BarChart barChart;
	private TimelineChart timelineChart;
	private PlotChart plotChart;
	private TreeChart treeChart;

	public AccessLineServlet() {
		barChart = new BarChart();
		timelineChart = new TimelineChart();
		plotChart = new PlotChart();
		treeChart = new TreeChart();
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String buffer = null;
		String type = request.getParameter("type");
		long msDate;
		Date date;

		if (type.equals("bar_all")) {
			buffer = barChart.getStatusCodeOccurences();
		} else if (type.equals("line_new")) {
			msDate = Long.parseLong(request.getParameter("date"));
			date = new Date(msDate);
			buffer = timelineChart.getLogLines(date);
		} else if (type.equals("line_replay")) {
			long smsDate = Long.parseLong(request.getParameter("start_date"));
			long emsDate = Long.parseLong(request.getParameter("end_date"));
			Date startDate = new Date(smsDate);
			Date endDate = new Date(emsDate);
			// System.out.println(startDate + " " + endDate);
			buffer = timelineChart.getLogLines(startDate, endDate);
		} else if (type.equals("plot_all")) {
			buffer = plotChart.getPageOccurences();
		} else if (type.equals("plot_new")) {
			msDate = Long.parseLong(request.getParameter("date"));
			date = new Date(msDate);
			buffer = plotChart.getPageOccurences(date);
		} else if (type.equals("tree_all")) {
			buffer = treeChart.getLogLines();
		}

		PrintWriter out = response.getWriter();
		out.write(buffer); // we send pairs of domain and value
	}

}
