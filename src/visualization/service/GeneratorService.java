package visualization.service;

import visualization.generator.impl.AccessLogGenerator;
import visualization.generator.impl.InternalLogGenerator;

public class GeneratorService {

	private AccessLogGenerator alg;
	private InternalLogGenerator ilg;
	private static int waitTime = 250; // waiting time between cycles (usually
										// 1 second)
	private boolean isRunning;

	public GeneratorService() {
	}

	public void startService(String accessPath, String internalPath) {
		this.isRunning = true;
		alg = new AccessLogGenerator(accessPath);
		ilg = new InternalLogGenerator(internalPath);
		while (isRunning == true) {
			try {
				alg.generateLog();
				ilg.generateLog();
				synchronized (this) {
					Thread.sleep(waitTime);
				}
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
	}

	public void stopService() {
		this.isRunning = false;
		alg.closeLog();
		ilg.closeLog();
	}
}
