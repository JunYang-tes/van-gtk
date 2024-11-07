import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import { app, Button, Box, Label, van } from '../../src/'

const count = van.state(0)

app(
  () => {
    const win = new Gtk.Window({
      child: Box(
        Button({
          label: "Inc",
          onclicked: () => {
            console.log("Inc")
            count.val++;
          }
        }),
        Box(
          { orientation: Gtk.Orientation.VERTICAL },
          Label({ label: van.derive(() => String(count.val)) }),
          Label({
            label: () => `Hello,${count.val}`
          }),
          "Count:",
          count,
          Box(
            "Remove if greater then 3:",
            () => count.val > 3 ? null : Label({ label: String(count.val) })
          ),

          Box(
            "Hide if greater then 3:",
            () => count.val > 3 ? "" : Label({ label: String(count.val) })
          )
        ),
        Button({
          label: "Dec",
          onclicked: () => {
            count.val--;
          }
        })
      )
    })
    return win;
  })
  .exitOnClose()
  .run()
