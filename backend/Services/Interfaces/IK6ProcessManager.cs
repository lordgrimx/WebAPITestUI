using System.Diagnostics;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IK6ProcessManager
    {
        /// <summary>
        /// Tries to get the Process object associated with a runId.
        /// </summary>
        bool TryGetProcess(string runId, out Process? process);

        /// <summary>
        /// Tries to get the runId (Guid as string) associated with a processId.
        /// </summary>
        bool TryGetRunId(int processId, out string? runId);

        /// <summary>
        /// Tries to get the Process object associated with a processId.
        /// </summary>
        bool TryGetProcessByPid(int processId, out Process? process);

        /// <summary>
        /// Starts tracking a running K6 process.
        /// </summary>
        void TrackProcess(string runId, int processId, Process process);

        /// <summary>
        /// Stops tracking a K6 process (e.g., after it exits normally or is stopped).
        /// </summary>
        void UntrackProcess(string runId, int processId);

        /// <summary>
        /// Attempts to stop a running K6 process by its PID and update its status in DB.
        /// Returns true if the process was found and kill signal was sent (or already exited), false otherwise.
        /// DB update happens asynchronously.
        /// </summary>
        bool StopProcess(int processId);
    }
} 