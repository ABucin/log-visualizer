package visualization.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import visualization.chart.impl.ConveyorChart;
import visualization.chart.impl.ConveyorParallelChart;
import visualization.chart.impl.PieChart;


@WebServlet("/InternalLineServlet")
public class InternalLineServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private PieChart pieChart;
	private ConveyorChart conveyorChart;
	private ConveyorParallelChart conveyorParallelChart;
	
	private long packet;
	
	public InternalLineServlet() {
		pieChart = new PieChart();
		conveyorChart = new ConveyorChart();
		conveyorParallelChart = new ConveyorParallelChart();
	}

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		String buffer = null;
		String type = request.getParameter("type");
		long msDate;
		Date date;

		if (type.equals("pie_all")) {
			buffer = pieChart.fetchMessageCount();
		} else if (type.equals("conv_all")) {
			buffer = conveyorChart.getLogLines();
		} else if (type.equals("conv_new")) {
			msDate = Long.parseLong(request.getParameter("date"));
			date = new Date(msDate);
			buffer = conveyorChart.getLogLines(date);
		} else if (type.equals("conv_par_all")) {
			packet = 1;
			buffer = conveyorParallelChart.getLogLines(packet);
		} else if (type.equals("conv_par_new")) {
			msDate = Long.parseLong(request.getParameter("date"));
			date = new Date(msDate);
			packet++;
			buffer = conveyorParallelChart.getLogLines(date, packet);
		} else if (type.equals("conv_par_replay")) {
			long smsDate = Long.parseLong(request.getParameter("start_date"));
			long emsDate = Long.parseLong(request.getParameter("end_date"));
			Date startDate = new Date(smsDate);
			Date endDate = new Date(emsDate);
			packet++;
			buffer = conveyorParallelChart.getLogLines(startDate, endDate, packet);
		}

		PrintWriter out = response.getWriter();
		out.write(buffer); // we send the buffer back to the client
	}

}
