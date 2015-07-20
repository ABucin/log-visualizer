package visualization.servlet;


import java.io.IOException;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import visualization.service.GeneratorService;
import visualization.service.ReaderService;

public class ReaderServiceServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private GeneratorService generatorService;
	private ReaderService readerService;
	private String accessPath;
	private String internalPath;
	private Date currentDate;
	
	public ReaderServiceServlet() {
		generatorService = new GeneratorService();
		readerService = new ReaderService();
	}
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		accessPath = request.getParameter("access_path");
		internalPath = request.getParameter("internal_path");
		Boolean run = Boolean.parseBoolean(request.getParameter("run"));
		
		//System.out.println(accessPath + " , " + internalPath);
		
		if(run!=null) {
			if(run==true) {
				currentDate = new Date();
				Thread generatorThread = new Thread(new GeneratorThread());
				generatorThread.start();
				Thread readerThread = new Thread(new ReaderThread());
				readerThread.start();
			} else {
				generatorService.stopService();
				readerService.stopService();
			}
		} 
	}
	
	private class GeneratorThread implements Runnable {

		@Override
		public void run() {
			generatorService.startService(accessPath, internalPath);
		}
		
	}
	
	private class ReaderThread implements Runnable {

		@Override
		public void run() {
			readerService.startService(accessPath, internalPath, currentDate);
		}
		
	}
}
