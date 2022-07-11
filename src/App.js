import React, { useEffect, useState } from "react";
import axios from "axios";
import { useElapsedTime } from "use-elapsed-time";
import {
  Alert,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import "./styles.scss";

const Search = () => {
  const [query, setQuery] = useState("");
  const [launch, setLaunch] = useState({});
  const [errorMessage, setErrorMessage] = useState(false);

  const handleSubmit = (e) => {
    /* request a launch by its ID */
    axios
      .create({
        baseURL: `https://api.spacexdata.com/v4/launches/${e.target[0].value}`,
      })
      .get()
      .then((response) => {
        setErrorMessage(false);
        setLaunch(response.data);
      })
      .catch(() => {
        setErrorMessage(true);
        setLaunch({});
      })
      .finally(() => {
        setQuery("");
      });
    e.preventDefault();
  };

  return (
    <form
      className="search--form"
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      <div className="search--bar row centered">
        <TextField
          id="outlined-basic"
          label="Search..."
          variant="standard"
          value={query}
          fullWidth
          onChange={(e) => setQuery(e.target.value)}
        />

        <Button
          type="submit"
          value="submit"
          variant="contained"
          color="primary"
          className="search--button"
          style={{marginLeft: "2rem"}}
          disabled={!query.length}
        >
          Submit
        </Button>
      </div>

      <div className="search--error">
        {errorMessage ? (
          <div>
            <h5>Search Result</h5>
            <Alert severity="error">ERROR: Invalid launch ID</Alert>
          </div>
        ) : null}
      </div>

      <div>
        {Object.keys(launch).length ? (
          <div>
            <h5>Search Result</h5>
            <Launch value={launch} />
          </div>
        ) : null}
      </div>
    </form>
  );
};

const Launch = (props) => {
  let status = {
    label: props.value.success ? "SUCCESS" : "FAILURE",
    color: props.value.success ? "success" : "error",
  };

  let launchDate = new Date(props.value["date_utc"]);
  let thisTime = new Date();

  let seconds = Math.floor((thisTime - launchDate) / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  hours = hours - days * 24;
  minutes = minutes - days * 24 * 60 - hours * 60;
  seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

  useElapsedTime({
    isPlaying: true,
    updateInterval: 1,
  });

  return (
    <Card sx={{ height: 200, width: "90vw", position: "relative" }}>
      <CardContent className="launch--card">
        <div className="row spaced aligned">
          <div className="row aligned">
            <img
              className="launch--icon"
              src={props.value.links.patch.small}
              alt="Launch Patch"
              width="50"
              height="50"
            />
            <Typography variant="h3">{props.value.name}</Typography>
          </div>

          <Stack direction="row-reverse" spacing={1}>
            <Chip label={status.label} color={status.color} />
          </Stack>
        </div>

        <CardActions className="row spaced aligned">
          <div className="launch--time">
            <Typography>Elapsed time since launch:</Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {days} days, {hours} hours, {minutes} minutes, {seconds} seconds
            </Typography>
          </div>
          <Typography variant="body2">ID: {props.value.id}</Typography>
        </CardActions>
      </CardContent>
    </Card>
  );
};

const App = () => {
  const [launches, setLaunches] = useState([]);

  useEffect(() => {
    axios
      .get("https://api.spacexdata.com/v4/launches/past")
      .then((response) => {
        setLaunches(response.data.slice(-3));
      });
  }, []);

  return (
    <div className="app">
      <h1 className="app--title">
        <Search />
      </h1>

      <Box className="past-launches">
        <div className="row spaced aligned">
          <Typography style={{ margin: "0 1rem" }} variant="h5">
            Past Launches
          </Typography>
        </div>
        <div className="past-launches--cards">
          {launches
            .map((launch) => {
              return (
                <Card className="past-launches--card" key={launch.id}>
                  <Typography variant="p" className="past-launches--title">
                    Name: {launch.name}
                  </Typography>
                  <CardContent className="column aligned">
                    <div>
                      <img
                        src={launch.links.patch.small}
                        alt="Launch Patch"
                        width="150"
                        height="150"
                      />
                    </div>
                    <p className="launch-body">
                      Launch Date:{" "}
                      {new Date(launch.date_utc).toLocaleDateString()}
                      <br />
                      Launch Time:{" "}
                      {new Date(launch.date_utc).toLocaleTimeString()}
                    </p>
                    <div>
                      <small>ID: {launch.id}</small>
                    </div>
                  </CardContent>
                </Card>
              );
            })
            .reverse()}
        </div>
      </Box>
    </div>
  );
};

export default App;
